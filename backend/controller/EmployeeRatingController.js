import Employee from "../model/employeeModel.js";
import EmployeeRating from "../model/EmployeeRatingModel.js";
import Attendance from "../model/AttendanceModel.js";
import Holiday from "../model/holidayModel.js";
import LeaveRequest from "../model/leaveRequestModel.js";

export const addOrUpdateEmployeeRating = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const {
            month,
            rating,
            behaviour,
            leadershipAndResponsibility,
            comments,
            givenBy,
        } = req.body;


        if (!month || rating === undefined || rating === null || !givenBy) {
            return res
                .status(400)
                .json({ message: "Month, rating, and givenBy are required" });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const attendanceData = await calculateMonthlyAttendancePercentage(employeeId, month);


        const attendanceStarRating = convertPercentageToStars(attendanceData.percentage, attendanceData.breakdown.totalDaysOff);

        let ratingDoc = await EmployeeRating.findOne({ employeeId, month });

        if (ratingDoc) {
            ratingDoc.rating = rating;
            ratingDoc.SystemRating = attendanceStarRating;
            ratingDoc.behaviour = behaviour;
            ratingDoc.leadershipAndResponsibility = leadershipAndResponsibility;
            ratingDoc.comments = comments;
            ratingDoc.givenBy = givenBy;
            ratingDoc.givenAt = new Date();
        } else {
            ratingDoc = new EmployeeRating({
                employeeId,
                month,
                rating,
                SystemRating: attendanceStarRating,
                behaviour,
                leadershipAndResponsibility,
                comments,
                givenBy,
            });
        }

        await ratingDoc.save();

        res.status(200).json({
            message: "Rating added/updated successfully",
            rating: ratingDoc,
            attendanceData: attendanceData,
            attendanceStarRating: attendanceStarRating
        });
    } catch (error) {
        console.error("Error adding/updating rating:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const convertPercentageToStars = (percentage, totalDaysOff) => {
    if (totalDaysOff <= 1) {
        return 5.0;
    }

    let stars = 1 + (percentage / 100) * 4;
    const penalty = (totalDaysOff - 1) * 0.1;
    stars = Math.max(1, stars - penalty);

    return Math.round(stars * 10) / 10;
};

const calculateMonthlyAttendancePercentage = async (employeeId, monthString) => {
    try {
        const [year, month] = monthString.split('-').map(Number);
        const actualMonth = month - 1;

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const startDate = new Date(Date.UTC(year, actualMonth, 1));
        let endDate = new Date(Date.UTC(year, actualMonth + 1, 0));
        endDate.setHours(23, 59, 59, 999);

        if (year === today.getFullYear() && actualMonth === today.getMonth()) {
            endDate = new Date(today);
        }

        const totalDaysInMonth = new Date(year, actualMonth + 1, 0).getDate();


        const holidaysInMonth = await Holiday.find({
            date: {
                $gte: new Date(Date.UTC(year, actualMonth, 1)),
                $lte: new Date(Date.UTC(year, actualMonth + 1, 0)),
            },
        });

        const numberOfHolidays = holidaysInMonth.length;

        const calculateWeekendDaysInMonth = (year, month) => {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            let weekendCount = 0;

            let current = new Date(firstDay);
            while (current <= lastDay) {
                if (current.getDay() === 0 || current.getDay() === 6) {
                    weekendCount++;
                }
                current.setDate(current.getDate() + 1);
            }
            return weekendCount;
        };

        const actualWeekendDays = calculateWeekendDaysInMonth(year, actualMonth);
        const totalWorkingDays = totalDaysInMonth - actualWeekendDays - numberOfHolidays;

        const allAttendance = await Attendance.find({
            employeeId: employeeId,
            date: { $gte: startDate, $lte: endDate }
        });

        const allLeaves = await LeaveRequest.find({
            employeeId: employeeId,
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        const approvedLeaveDates = new Set();
        const pendingLeaveDates = new Set();
        const rejectedLeaveDates = new Set();

        allLeaves.forEach(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            let day = new Date(start);
            while (day <= end) {
                const dayStr = day.toISOString().split("T")[0];
                if (day >= startDate && day <= endDate) {
                    if (leave.status === "Approved") {
                        approvedLeaveDates.add(dayStr);
                    } else if (leave.status === "Pending") {
                        pendingLeaveDates.add(dayStr);
                    } else if (leave.status === "Rejected") {
                        rejectedLeaveDates.add(dayStr);
                    }
                }
                day.setDate(day.getDate() + 1);
            }
        });

        let daysPresent = 0;
        let totalDaysConsidered = 0;
        let fullDays = 0;
        let threeFourthDays = 0;
        let halfDays = 0;
        let quarterDays = 0;
        let approvedLeaveDays = 0;
        let pendingLeaveDays = 0;
        let absentDays = 0;


        let current = new Date(startDate);
        while (current <= endDate) {
            const dateStr = current.toISOString().split("T")[0];
            const isWeekend = current.getUTCDay() === 0 || current.getUTCDay() === 6;
            const isHoliday = holidaysInMonth.some(holiday =>
                new Date(holiday.date).toISOString().split("T")[0] === dateStr
            );
            const isPastOrToday = current <= today;


            if (!isWeekend && !isHoliday && isPastOrToday) {
                totalDaysConsidered++;


                if (approvedLeaveDates.has(dateStr)) {
                    approvedLeaveDays++;
                    daysPresent += 0;
                } else if (pendingLeaveDates.has(dateStr)) {
                    pendingLeaveDays++;
                    daysPresent += 0;
                } else {
                    const attendanceRecord = allAttendance.find(
                        att => new Date(att.date).toISOString().split("T")[0] === dateStr
                    );

                    if (attendanceRecord) {
                        const workingDay = attendanceRecord.workingDay || 0;
                        daysPresent += workingDay;

                        if (workingDay === 1) fullDays++;
                        else if (workingDay === 0.75) threeFourthDays++;
                        else if (workingDay === 0.5) halfDays++;
                        else if (workingDay === 0.25) quarterDays++;
                    } else {
                        absentDays++;
                        daysPresent += 0;
                    }
                }
            }

            current.setUTCDate(current.getUTCDate() + 1);
        }

        const attendancePercentage = totalDaysConsidered > 0
            ? Math.round((daysPresent / totalDaysConsidered) * 100)
            : 0;

        return {
            percentage: attendancePercentage,
            breakdown: {
                totalWorkingDays: totalDaysConsidered,
                fullDays,
                threeFourthDays,
                halfDays,
                quarterDays,
                approvedLeaveDays,
                pendingLeaveDays,
                absentDays,
                totalPresent: Math.round(daysPresent * 4) / 4,
                actualWorkingDays: fullDays + threeFourthDays + halfDays + quarterDays,
                totalDaysOff: approvedLeaveDays + pendingLeaveDays + absentDays
            }
        };

    } catch (error) {
        console.error("Error calculating attendance percentage:", error);
        return {
            percentage: 0,
            breakdown: null
        };
    }
};

export const getEmployeeRatings = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const ratings = await EmployeeRating.find({ employeeId }).sort({ month: -1 });
        res.status(200).json({ ratings });
    } catch (error) {
        console.error("Error fetching ratings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
