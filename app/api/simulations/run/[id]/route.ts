import { NextResponse } from 'next/server'
import { runSimulation } from '../../../../../lib/simulations'

export async function POST(_req: Request, ctx: any) {
  const id: string = ctx?.params?.id
  try {
    const run = await runSimulation(id)
    return NextResponse.json(run)
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 })
  }
}
