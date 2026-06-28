import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Fetch the user's role to determine if they should receive role-based broadcasts
    const queryingUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!queryingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const OR_conditions: any[] = [
      { senderId: userId },
      { receiverId: userId },
      { targetType: 'all' }
    ];

    if (queryingUser.role === 'student') {
      OR_conditions.push({
        AND: [
          { targetType: 'student' },
          { receiverId: null }
        ]
      });
    }

    if (queryingUser.role === 'faculty') {
      OR_conditions.push({
        AND: [
          { targetType: 'faculty' },
          { receiverId: null }
        ]
      });
    }

    const messages = await db.message.findMany({
      where: {
        OR: OR_conditions
      },
      include: {
        sender: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    const mappedMessages = messages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender.name,
      receiverId: m.receiverId || undefined,
      targetType: m.targetType as any,
      title: m.title,
      content: m.content,
      messageType: m.messageType as any,
      isRead: m.isRead,
      sentAt: m.sentAt,
    }));

    return NextResponse.json({
      success: true,
      messages: mappedMessages
    });

  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch messages'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, targetType, title, content, messageType } = body;

    if (!senderId || !title || !content) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        senderId,
        receiverId: receiverId || null,
        targetType,
        title,
        content,
        messageType: messageType || 'info',
        isRead: false,
      },
      include: {
        sender: {
          select: {
            name: true
          }
        }
      }
    });

    // Simulate sending email alert
    if (receiverId && (messageType === 'warning' || messageType === 'alert')) {
      try {
        const receiver = await db.user.findUnique({ where: { id: receiverId } });
        if (receiver) {
          const emailTo = targetType === 'parent' ? receiver.parentEmail : receiver.email;
          if (emailTo) {
            console.log(`\n\n[EMAIL SERVICE API] Sending ${messageType.toUpperCase()} to ${emailTo}`);
            console.log(`Subject: ${title}`);
            console.log(`Content: ${content}`);
            console.log(`========================================================\n\n`);
          }
        }
      } catch (e) {
        console.error('Failed to send simulated email:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender.name,
        receiverId: message.receiverId || undefined,
        targetType: message.targetType,
        title: message.title,
        content: message.content,
        messageType: message.messageType,
        isRead: message.isRead,
        sentAt: message.sentAt,
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send message'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const all = searchParams.get('all');
    const userId = searchParams.get('userId');

    if (all === 'true' && userId) {
      await db.message.updateMany({
        where: {
          receiverId: userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
      return NextResponse.json({
        success: true,
        message: 'All messages marked as read'
      });
    }

    if (!messageId) {
      return NextResponse.json({
        success: false,
        message: 'Message ID is required'
      }, { status: 400 });
    }

    const updatedMessage = await db.message.update({
      where: { id: messageId },
      data: { isRead: true }
    });

    return NextResponse.json({
      success: true,
      message: updatedMessage
    });

  } catch (error) {
    console.error('Update message error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update message'
    }, { status: 500 });
  }
}
