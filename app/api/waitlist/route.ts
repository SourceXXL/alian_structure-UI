import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, you'd want to use a database
interface WaitlistEntry {
  email: string;
  walletAddress?: string;
  joinedAt: string;
}

const waitlistEntries: WaitlistEntry[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress } = await request.json();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (waitlistEntries.some(entry => entry.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Email already registered for waitlist' },
        { status: 409 }
      );
    }

    // Add to waitlist
    const newEntry: WaitlistEntry = {
      email: email.toLowerCase(),
      walletAddress,
      joinedAt: new Date().toISOString(),
    };
    
    waitlistEntries.push(newEntry);

    // Log for demonstration
    console.log(`Added to waitlist: ${email} (Wallet: ${walletAddress || 'None'})`);
    console.log(`Total waitlist size: ${waitlistEntries.length}`);

    return NextResponse.json(
      { 
        message: 'Successfully added to waitlist',
        position: waitlistEntries.length 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const walletAddress = searchParams.get('walletAddress');

  if (email) {
    const entry = waitlistEntries.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (entry) {
      return NextResponse.json({
        joined: true,
        joinedAt: entry.joinedAt,
        position: waitlistEntries.indexOf(entry) + 1
      });
    }
  }

  if (walletAddress) {
    const entry = waitlistEntries.find(e => e.walletAddress === walletAddress);
    if (entry) {
      return NextResponse.json({
        joined: true,
        joinedAt: entry.joinedAt,
        position: waitlistEntries.indexOf(entry) + 1
      });
    }
  }

  return NextResponse.json({
    joined: false,
    count: waitlistEntries.length
  });
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
