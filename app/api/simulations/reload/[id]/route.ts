import { NextResponse } from 'next/server'
import { reloadSimulation } from '../../../../../lib/simulations'

export async function POST(_req: Request, ctx: any) {
  const id: string = ctx?.params?.id
  try {
    const sim = await reloadSimulation(id)
    return NextResponse.json(sim)
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 })
  }
}
