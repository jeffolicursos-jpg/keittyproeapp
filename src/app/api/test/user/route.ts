import { NextResponse } from 'next/server';
import { findByEmail } from '@/repositories/users.repo';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const user = await findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // 🔥 Remove senha_hash antes de retornar
    const { senha_hash, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}