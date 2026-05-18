import { NextRequest, NextResponse } from 'next/server';
import { PRIORITY_REWARDS, CATEGORY_MULTIPLIERS, type BugReport } from '../../../types/bug-report';

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const bugReports: BugReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const stepsToReproduce = formData.get('stepsToReproduce') as string;
    const expectedBehavior = formData.get('expectedBehavior') as string;
    const actualBehavior = formData.get('actualBehavior') as string;
    const priority = formData.get('priority') as 'low' | 'medium' | 'high' | 'critical';
    const category = formData.get('category') as 'ui' | 'functionality' | 'performance' | 'security' | 'other';
    const reporterEmail = formData.get('reporterEmail') as string;
    const agreeToTerms = formData.get('agreeToTerms') === 'true';
    
    // Extract screenshots
    const screenshots: string[] = [];
    for (let i = 0; i < 5; i++) {
      const screenshot = formData.get(`screenshot_${i}`) as File;
      if (screenshot) {
        // In production, upload to cloud storage and store URL
        // For demo, we'll just store the filename
        screenshots.push(screenshot.name);
      }
    }

    // Validate required fields
    if (!title || !description || !stepsToReproduce || !expectedBehavior || !actualBehavior || !priority || !category || !agreeToTerms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate reward
    const baseReward = PRIORITY_REWARDS[priority];
    const categoryMultiplier = CATEGORY_MULTIPLIERS[category];
    const rewardAmount = Math.round(baseReward * categoryMultiplier);

    // Create bug report
    const bugReport: BugReport = {
      id: `BR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      priority,
      category,
      screenshots,
      reporterAddress: 'demo-wallet-address', // In production, get from authenticated user
      reporterEmail: reporterEmail || undefined,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rewardAmount,
      rewardStatus: 'pending'
    };

    // Store bug report
    bugReports.push(bugReport);

    console.log('Bug report submitted:', bugReport);

    return NextResponse.json({
      success: true,
      bugReport: {
        id: bugReport.id,
        title: bugReport.title,
        status: bugReport.status,
        rewardAmount: bugReport.rewardAmount,
        estimatedPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting bug report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // In production, this would fetch from database with proper filtering
    return NextResponse.json({
      bugReports: bugReports.slice(0, 10), // Return last 10 reports for demo
      total: bugReports.length
    });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
