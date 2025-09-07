import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const committee = searchParams.get('committee')

        if (!committee) {
        return NextResponse.json(
            { error: 'Committee parameter is required' },
            { status: 400 }
        )
        }

        // Get current date and date 2 weeks from now
        const now = new Date()
        const twoWeeksLater = new Date()
        twoWeeksLater.setDate(now.getDate() + 14)

        // Get unavailable times (where maxSlots = 0)
        const unavailableTimes = await prisma.availableEBInterviewTime.findMany({
        where: {
            eb: committee,
            maxSlots: 0, // This indicates unavailable slots
            day: {
            gte: now.toISOString().split('T')[0],
            lte: twoWeeksLater.toISOString().split('T')[0]
            }
        },
        orderBy: [
            { day: 'asc' },
            { timeStart: 'asc' }
        ]
        })

        // Get already booked interviews for this committee
        const bookedInterviews = await prisma.committeeApplication.findMany({
        where: {
            firstOptionCommittee: committee,
            interviewSlotDay: { not: '' },
            interviewSlotTimeStart: { not: '' },
            interviewSlotTimeEnd: { not: '' }
        },
        select: {
            interviewSlotDay: true,
            interviewSlotTimeStart: true,
            interviewSlotTimeEnd: true
        }
        })

        // Generate all possible time slots (7 AM to 9 PM, 30-minute intervals)
        const generateTimeSlots = () => {
            const slots = [];
            for (let hour = 7; hour < 21; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const endHour = minute === 30 ? hour + 1 : hour;
                const endMinute = minute === 30 ? 0 : 30;
                const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
                
                slots.push({
                    time: timeStr,
                    endTime: endTimeStr,
                    displayTime: `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`,
                    endDisplayTime: `${endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour}:${endMinute.toString().padStart(2, '0')} ${endHour >= 12 ? 'PM' : 'AM'}`
                });
                }
            }
            return slots;
        };

        const allTimeSlots = generateTimeSlots();

        // Generate available dates (next 14 days)
        const generateAvailableDates = () => {
        const dates = [];
        const currentDate = new Date(now);
        
        for (let i = 0; i < 14; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
            return dates;
        };

        const availableDates = generateAvailableDates();

        // Calculate available slots (times not in unavailableTimes and not booked)
        const availableSlots = [];

        for (const date of availableDates) {
            for (const timeSlot of allTimeSlots) {
                const isUnavailable = unavailableTimes.some(unav => {
                    return unav.day === date && 
                        timeSlot.time >= unav.timeStart && 
                        timeSlot.time < unav.timeEnd;
                });

                const isBooked = bookedInterviews.some(booked => {
                const bookedDate = new Date(booked.interviewSlotDay).toISOString().split('T')[0];
                    return bookedDate === date && 
                        timeSlot.time === booked.interviewSlotTimeStart;
                });

                if (!isUnavailable && !isBooked) {
                    availableSlots.push({
                        id: `${date}-${timeSlot.time}`,
                        date: date,
                        time: timeSlot.time,
                        endTime: timeSlot.endTime,
                        displayTime: timeSlot.displayTime,
                        endDisplayTime: timeSlot.endDisplayTime,
                        isAvailable: true
                    });
                }
            }
        }

        return NextResponse.json({
            availableSlots,
            unavailableTimes,
            bookedInterviews
        });

    } catch (error) {
        console.error('Error fetching interview slots:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}