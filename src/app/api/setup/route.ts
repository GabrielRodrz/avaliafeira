import { NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { usernameToEmail } from "@/lib/auth-helpers";
import { OFFICIAL_CRITERIA } from "@/types";
import { INITIAL_PROJECTS, INITIAL_SETTINGS } from "@/lib/mock-data";

const DEFAULT_ADMIN_USERNAME = "gabriel.rodrigues";
const DEFAULT_ADMIN_NAME = "Gabriel Rodrigues";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "Gabri0708.#";

export async function GET() {
  return handleSetup();
}

export async function POST() {
  return handleSetup();
}

async function handleSetup() {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({
        success: true,
        configured: false,
        message: "Supabase não configurado no .env.local. Modo demonstração ativo.",
        defaultAdmin: {
          username: DEFAULT_ADMIN_USERNAME,
          name: DEFAULT_ADMIN_NAME,
        },
      });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Falha ao inicializar cliente administrativo do Supabase" },
        { status: 500 }
      );
    }

    const targetEmail = usernameToEmail(DEFAULT_ADMIN_USERNAME);

    // 1. Verificar se o admin padrão já existe na tabela admin_users
    const { data: existingAdminUser, error: checkError } = await admin
      .from("admin_users")
      .select("id, user_id, username, is_master")
      .eq("username", DEFAULT_ADMIN_USERNAME)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.warn("Aviso ao consultar admin_users:", checkError.message);
    }

    let authUserId = existingAdminUser?.user_id;

    // 2. Se não encontrou na tabela ou precisa verificar no Supabase Auth
    if (!authUserId) {
      const { data: listData, error: listError } = await admin.auth.admin.listUsers();
      if (listError) {
        console.error("Erro ao listar usuários no Auth:", listError);
      } else {
        const foundUser = listData?.users.find((u) => u.email?.toLowerCase() === targetEmail);
        if (foundUser) {
          authUserId = foundUser.id;
        }
      }

      // 3. Se não existe no Auth, cria automaticamente
      if (!authUserId) {
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email: targetEmail,
          password: DEFAULT_ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: {
            name: DEFAULT_ADMIN_NAME,
            username: DEFAULT_ADMIN_USERNAME,
          },
        });

        if (createError) {
          // Se o erro for que o usuário já existe, tentar recuperar o ID
          if (createError.message.toLowerCase().includes("already registered")) {
            const { data: relist } = await admin.auth.admin.listUsers();
            const relistUser = relist?.users.find((u) => u.email?.toLowerCase() === targetEmail);
            if (relistUser) {
              authUserId = relistUser.id;
            }
          } else {
            console.error("Erro ao criar usuário admin padrão no Auth:", createError);
            return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
          }
        } else if (newUser?.user) {
          authUserId = newUser.user.id;
        }
      }

      // 4. Se temos o ID do Auth, garantir presença na tabela admin_users
      if (authUserId) {
        const { error: insertError } = await admin.from("admin_users").upsert(
          {
            user_id: authUserId,
            username: DEFAULT_ADMIN_USERNAME,
            name: DEFAULT_ADMIN_NAME,
            is_master: true,
          },
          { onConflict: "username" }
        );

        if (insertError) {
          console.error("Erro ao inserir admin padrão na tabela admin_users:", insertError);
        }
      }
    }

    // 5. Garantir que os critérios padrão estão populados no banco
    const { count: criteriaCount } = await admin
      .from("criteria")
      .select("*", { count: "exact", head: true });

    if (criteriaCount === 0 || criteriaCount === null) {
      await admin.from("criteria").upsert(
        OFFICIAL_CRITERIA.map((c) => ({
          id: c.id,
          order_num: c.order_num,
          name: c.name,
          description: c.description,
          weight: c.weight || 1.0,
          tie_breaker_order: c.tie_breaker_order || null,
        }))
      );
    }

    // 6. Garantir que fair_settings possui pelo menos um registro
    const { count: settingsCount } = await admin
      .from("fair_settings")
      .select("*", { count: "exact", head: true });

    if (settingsCount === 0 || settingsCount === null) {
      await admin.from("fair_settings").insert({
        name: INITIAL_SETTINGS.name,
        edition: INITIAL_SETTINGS.edition,
        date: INITIAL_SETTINGS.date,
        location: INITIAL_SETTINGS.location,
        description: INITIAL_SETTINGS.description,
        is_active: true,
      });
    }

    // 7. Garantir que projetos iniciais existem para testes
    const { count: projectsCount } = await admin
      .from("projects")
      .select("*", { count: "exact", head: true });

    if (projectsCount === 0 || projectsCount === null) {
      await admin.from("projects").insert(
        INITIAL_PROJECTS.map((p) => ({
          code: p.code,
          title: p.title,
          category: p.category,
          members: p.members,
          advisor: p.advisor,
          stand: p.stand,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      configured: true,
      message: "Admin padrão provisionado com sucesso e banco inicializado.",
      defaultAdmin: {
        username: DEFAULT_ADMIN_USERNAME,
        name: DEFAULT_ADMIN_NAME,
        isMaster: true,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Erro geral na rota /api/setup:", errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
