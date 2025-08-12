import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// --- Genetic Algorithm Parameters ---
const POPULATION_SIZE = 50;
const MAX_GENERATIONS = 100;
const MUTATION_RATE = 0.1;
const ELITISM_RATE = 0.1; // Keep the top 10% of the population

export async function POST(request) {
    try {
        // 1. --- Authenticate and Fetch All Data ---
        const tokenCookie = cookies().get('auth_token');
        if (!tokenCookie) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }
        const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
        if (!payload.schoolId || payload.role !== 'ADMIN') { return NextResponse.json({ message: 'Forbidden' }, { status: 403 }); }
        const schoolId = payload.schoolId;

        const [classes, teachers, subjects, requirements, timeSlots] = await Promise.all([
            prisma.class.findMany({ where: { schoolId } }),
            prisma.user.findMany({ where: { schoolId, role: 'TEACHER' }, include: { teachableSubjects: { select: { id: true } } } }),
            prisma.subject.findMany({ where: { schoolId } }),
            prisma.classSubjectRequirement.findMany({ where: { class: { schoolId } } }),
            prisma.timeSlot.findMany({ where: { schoolId, isBreak: false } }),
        ]);
        
        // Create a flat list of required lessons to be scheduled
        const lessonsToSchedule = requirements.flatMap(req => Array(req.periodsPerWeek).fill({ classId: req.classId, subjectId: req.subjectId }));

        // --- Helper Functions ---
        const getRandomTeacherForSubject = (subjectId) => {
            const qualifiedTeachers = teachers.filter(t => t.teachableSubjects.some(s => s.id === subjectId));
            return qualifiedTeachers[Math.floor(Math.random() * qualifiedTeachers.length)];
        };

        // 2. --- Initialize Population ---
        let population = [];
        for (let i = 0; i < POPULATION_SIZE; i++) {
            let timetable = [];
            const availableSlots = [...timeSlots];
            for (const lesson of lessonsToSchedule) {
                if (availableSlots.length === 0) break;
                const slotIndex = Math.floor(Math.random() * availableSlots.length);
                const slot = availableSlots.splice(slotIndex, 1)[0];
                const teacher = getRandomTeacherForSubject(lesson.subjectId);
                if (teacher) {
                    timetable.push({ ...lesson, timeSlotId: slot.id, teacherId: teacher.id });
                }
            }
            population.push(timetable);
        }

        // 3. --- Fitness Function ---
        const calculateFitness = (timetable) => {
            let clashes = 0;
            const schedule = new Map(); // Using a map to easily check for clashes
            for (const entry of timetable) {
                const teacherSlotKey = `${entry.teacherId}-${entry.timeSlotId}`;
                const classSlotKey = `${entry.classId}-${entry.timeSlotId}`;

                if (schedule.has(teacherSlotKey)) clashes++;
                else schedule.set(teacherSlotKey, true);

                if (schedule.has(classSlotKey)) clashes++;
                else schedule.set(classSlotKey, true);
            }
            return clashes;
        };
        
        // 4. --- Evolution Loop ---
        let bestTimetable = population[0];
        let bestFitness = calculateFitness(bestTimetable);

        for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
            // Score the population
            const scoredPopulation = population.map(timetable => ({ timetable, fitness: calculateFitness(timetable) }))
                .sort((a, b) => a.fitness - b.fitness);
            
            bestTimetable = scoredPopulation[0].timetable;
            bestFitness = scoredPopulation[0].fitness;
            
            // Found a perfect solution
            if (bestFitness === 0) break;

            // Elitism: Keep the best individuals
            const eliteCount = Math.floor(POPULATION_SIZE * ELITISM_RATE);
            const elites = scoredPopulation.slice(0, eliteCount).map(p => p.timetable);

            // Crossover & Mutation
            let nextPopulation = [...elites];
            while (nextPopulation.length < POPULATION_SIZE) {
                const parent1 = elites[Math.floor(Math.random() * elites.length)];
                const parent2 = elites[Math.floor(Math.random() * elites.length)];
                const crossoverPoint = Math.floor(Math.random() * parent1.length);
                let child = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
                
                // Mutation
                if (Math.random() < MUTATION_RATE) {
                    const index1 = Math.floor(Math.random() * child.length);
                    const index2 = Math.floor(Math.random() * child.length);
                    [child[index1], child[index2]] = [child[index2], child[index1]]; // Swap two lessons
                }
                nextPopulation.push(child);
            }
            population = nextPopulation;
        }

        if (bestFitness > 0) {
            // Could not find a perfect solution
            // For this project, we'll save the best one we found. In a real app, you'd return an error.
        }

        // 5. --- Save the Best Timetable to the Database ---
        await prisma.$transaction([
            prisma.timetableEntry.deleteMany({ where: { schoolId } }),
            prisma.timetableEntry.createMany({
                data: bestTimetable.map(entry => ({
                    classId: entry.classId,
                    subjectId: entry.subjectId,
                    teacherId: entry.teacherId,
                    timeSlotId: entry.timeSlotId,
                    schoolId: schoolId,
                }))
            })
        ]);
        
        return NextResponse.json({ message: 'Timetable generated successfully', fitness: bestFitness });

    } catch (error) {
        console.error("Timetable generation error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}