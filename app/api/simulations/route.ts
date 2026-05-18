import { NextResponse } from 'next/server'
import { getSimulations } from '../../../lib/simulations'

export async function GET() {
  try {
    const sims = await getSimulations()
    return NextResponse.json(sims)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
