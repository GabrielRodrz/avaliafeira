import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { isValidUsername, usernameToEmail } from "@/lib/auth-helpers";

type AuthResult =
  | {
      authenticated: false;
      error: string;
      status: number;
      isDemo?: false;
      currentUser?: never;
      adminClient?: never;
    }
  | {
      authenticated: true;
      isDemo: true;
      currentUser: {
        id: string;
        user_id: string;
        username: string;
        name: string;
        is_master: boolean;
      };
      adminClient?: never;
      error?: never;
      status?: never;
    }
  | {
      authenticated: true;
      isDemo: false;
      currentUser: {
        id: string;
        user_id: string;
        username: string;
        name: string;
        is_master: boolean;
      };
      adminClient: any;
      error?: never;
      status?: never;
    };

// Função para validar token do requisitante e checar se é admin autorizado
async function authenticateAdmin(req: NextRequest): Promise<AuthResult> {
  if (!isSupabaseAdminConfigured()) {
    // Modo demonstração
    return {
      authenticated: true,
      isDemo: true,
      currentUser: {
        id: "demo-admin-id",
        user_id: "demo-auth-id",
        username: "gabriel.rodrigues",
        name: "Gabriel Rodrigues",
        is_master: true,
      },
    };
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { authenticated: false, error: "Token de autorização não fornecido.", status: 401 };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return { authenticated: false, error: "Serviço administrativo indisponível.", status: 500 };
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return { authenticated: false, error: "Sessão inválida ou expirada.", status: 401 };
  }

  // Verificar se o usuário está cadastrado na tabela admin_users
  const { data: adminRecord, error: adminError } = await admin
    .from("admin_users")
    .select("id, user_id, username, name, is_master")
    .eq("user_id", userData.user.id)
    .single();

  if (adminError || !adminRecord) {
    return {
      authenticated: false,
      error: "Usuário autenticado não possui privilégios de administrador.",
      status: 403,
    };
  }

  return {
    authenticated: true,
    isDemo: false,
    currentUser: adminRecord,
    adminClient: admin,
  };
}

// GET: Listar administradores
export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (auth.isDemo) {
    return NextResponse.json({
      users: [
        {
          id: "demo-1",
          username: "gabriel.rodrigues",
          name: "Gabriel Rodrigues",
          is_master: true,
          created_at: new Date().toISOString(),
        },
      ],
      isDemo: true,
    });
  }

  const admin = auth.adminClient!;
  const { data: users, error } = await admin
    .from("admin_users")
    .select("id, user_id, username, name, is_master, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users, isDemo: false });
}

// POST: Cadastrar novo administrador
export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { name, username, password } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Nome completo é obrigatório." }, { status: 400 });
    }

    if (!username || !isValidUsername(username)) {
      return NextResponse.json(
        { error: "Nome de usuário inválido. Use de 3 a 30 caracteres alfanuméricos, pontos ou traços." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "A senha deve conter no mínimo 6 caracteres." }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    if (auth.isDemo) {
      return NextResponse.json({
        success: true,
        message: "Administrador cadastrado (modo demonstração).",
        user: {
          id: `demo-${Date.now()}`,
          username: cleanUsername,
          name: name.trim(),
          is_master: false,
          created_at: new Date().toISOString(),
        },
      });
    }

    const admin = auth.adminClient!;

    // Verificar se já existe na tabela admin_users
    const { data: existing } = await admin
      .from("admin_users")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Este nome de usuário já está em uso." }, { status: 400 });
    }

    // Criar usuário no Supabase Auth
    const targetEmail = usernameToEmail(cleanUsername);
    const { data: newAuthUser, error: authError } = await admin.auth.admin.createUser({
      email: targetEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        username: cleanUsername,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!newAuthUser.user) {
      return NextResponse.json({ error: "Falha ao criar usuário de autenticação." }, { status: 500 });
    }

    // Inserir registro na tabela admin_users
    const { data: insertedRecord, error: insertError } = await admin
      .from("admin_users")
      .insert({
        user_id: newAuthUser.user.id,
        username: cleanUsername,
        name: name.trim(),
        is_master: false,
      })
      .select()
      .single();

    if (insertError) {
      // Reverter criação no Auth caso falhe inserção na tabela
      await admin.auth.admin.deleteUser(newAuthUser.user.id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Administrador cadastrado com sucesso.",
      user: insertedRecord,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// DELETE: Excluir administrador secundário
export async function DELETE(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("id");

  if (!targetId) {
    return NextResponse.json({ error: "ID do administrador não informado." }, { status: 400 });
  }

  if (auth.isDemo) {
    return NextResponse.json({
      success: true,
      message: "Administrador removido (modo demonstração).",
    });
  }

  const admin = auth.adminClient!;

  // Buscar administrador alvo
  const { data: targetAdmin, error: fetchError } = await admin
    .from("admin_users")
    .select("id, user_id, username, is_master")
    .eq("id", targetId)
    .single();

  if (fetchError || !targetAdmin) {
    return NextResponse.json({ error: "Administrador não encontrado." }, { status: 404 });
  }

  // Bloqueio rigoroso: is_master = true nunca pode ser excluído!
  if (targetAdmin.is_master || targetAdmin.username === "gabriel.rodrigues") {
    return NextResponse.json(
      { error: "Operação negada: O administrador padrão (is_master) está protegido contra exclusão." },
      { status: 403 }
    );
  }

  // Excluir do Supabase Auth
  if (targetAdmin.user_id) {
    const { error: delAuthError } = await admin.auth.admin.deleteUser(targetAdmin.user_id);
    if (delAuthError) {
      console.warn("Aviso ao remover usuário do Auth:", delAuthError.message);
    }
  }

  // Excluir da tabela admin_users
  const { error: delTableError } = await admin.from("admin_users").delete().eq("id", targetId);

  if (delTableError) {
    return NextResponse.json({ error: delTableError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Administrador excluído com sucesso.",
  });
}

// PATCH: Alterar senha (própria senha ou de admin)
export async function PATCH(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { newPassword, targetAdminId } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve possuir pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    if (auth.isDemo) {
      return NextResponse.json({
        success: true,
        message: "Senha alterada com sucesso (modo demonstração).",
      });
    }

    const admin = auth.adminClient!;
    let targetUserId = auth.currentUser.user_id;

    // Se informou targetAdminId e é master admin, permite redefinir de outro admin
    if (targetAdminId && targetAdminId !== auth.currentUser.id) {
      if (!auth.currentUser.is_master) {
        return NextResponse.json(
          { error: "Apenas administradores master podem alterar a senha de terceiros." },
          { status: 403 }
        );
      }

      const { data: targetRecord } = await admin
        .from("admin_users")
        .select("user_id")
        .eq("id", targetAdminId)
        .single();

      if (!targetRecord) {
        return NextResponse.json({ error: "Administrador alvo não encontrado." }, { status: 404 });
      }
      targetUserId = targetRecord.user_id;
    }

    // Atualizar senha no Supabase Auth
    const { error: updateError } = await admin.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Senha atualizada com sucesso.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
