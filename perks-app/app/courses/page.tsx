"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, BookOpen, Check, Gift, Star, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCourses, getCourseById, getUserCompletions, completeCourse, getWallet } from "@/lib/supabase"

type Course = {
  id: string; title: string; description: string; category: string;
  image_url: string; lesson_type: string; lesson_title: string;
  lesson_content: string; credits_reward: number;
}

type Screen = "list" | "detail" | "lesson" | "complete"

export default function CoursesApp() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>("list")
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [rewardResult, setRewardResult] = useState<{ credits_earned: number; new_balance: number } | null>(null)
  const [lessonChecked, setLessonChecked] = useState(false)

  const USER_ID = "u_maria01"

  useEffect(() => {
    async function load() {
      const [coursesData, completions] = await Promise.all([
        getCourses(),
        getUserCompletions(USER_ID),
      ])
      setCourses(coursesData)
      setCompletedIds(completions)
      setLoading(false)
    }
    load()
  }, [])

  const handleComplete = async () => {
    if (!selectedCourse || completing) return
    setCompleting(true)
    try {
      const result = await completeCourse(USER_ID, selectedCourse.id)
      setRewardResult(result)
      setCompletedIds(prev => [...prev, selectedCourse.id])
      setScreen("complete")
    } catch (e: any) {
      if (e.message === "ALREADY_COMPLETED") {
        alert("Ya completaste este curso")
      }
    }
    setCompleting(false)
  }

  // ===== STATUS BAR =====
  const StatusBar = () => (
    <div className="flex items-center justify-between px-5 pt-3 pb-1">
      <span className="text-[15px] font-semibold text-[#1A1A2E]">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#1A1A2E"><rect x="0" y="5" width="3" height="6" rx="0.5"/><rect x="4.3" y="3.5" width="3" height="7.5" rx="0.5"/><rect x="8.6" y="1.5" width="3" height="9.5" rx="0.5"/><rect x="12.9" y="0" width="3" height="11" rx="0.5"/></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="#1A1A2E"><path d="M7.5 3.2C5.5 3.2 3.7 4 2.3 5.3L0.8 3.8C2.6 2 4.9 1 7.5 1C10.1 1 12.4 2 14.2 3.8L12.7 5.3C11.3 4 9.5 3.2 7.5 3.2ZM7.5 6C6.2 6 5 6.5 4.1 7.3L5.6 8.8C6.2 8.3 6.8 8 7.5 8C8.2 8 8.8 8.3 9.4 8.8L10.9 7.3C10 6.5 8.8 6 7.5 6Z"/><circle cx="7.5" cy="10.5" r="1.2"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#1A1A2E" strokeWidth="1"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="#1A1A2E"/><rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="#1A1A2E"/></svg>
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-[#F2F3F7] flex items-center justify-center">
      <div className="text-[#8E8E93] text-[15px]">Cargando...</div>
    </div>
  )

  // ===== COMPLETION SCREEN =====
  if (screen === "complete" && rewardResult) {
    return (
      <div className="min-h-screen bg-[#F2F3F7] flex justify-center">
        <div className="w-full max-w-[420px] min-h-screen bg-[#F2F3F7] flex flex-col">
          <StatusBar />
          <div className="bg-white px-4 py-3 flex items-center justify-between">
            <span className="text-[17px] font-semibold text-[#1A1A2E]">{selectedCourse?.title?.substring(0, 25)}...</span>
            <button onClick={() => { setScreen("list"); setLessonChecked(false); }} className="text-[#8E8E93]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Confetti area */}
          <div className="relative bg-[#F0FDF4] py-10 overflow-hidden">
            {/* Simple confetti dots */}
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute rounded-full" style={{
                width: i % 3 === 0 ? 8 : 5,
                height: i % 3 === 0 ? 8 : 5,
                background: i % 4 === 0 ? '#34C759' : i % 4 === 1 ? '#4B5EAA' : i % 4 === 2 ? '#E8B230' : '#34C759',
                left: `${(i * 37 + 10) % 90}%`,
                top: `${(i * 23 + 5) % 80}%`,
                opacity: 0.6 + (i % 3) * 0.15,
              }} />
            ))}
            {/* Stars */}
            {[...Array(6)].map((_, i) => (
              <Star key={`s${i}`} size={14} className="absolute" style={{
                left: `${(i * 43 + 5) % 85}%`,
                top: `${(i * 31 + 10) % 70}%`,
                color: '#34C759',
                fill: '#34C759',
                opacity: 0.5,
              }} />
            ))}
            <div className="relative flex justify-center">
              <div className="w-[72px] h-[72px] rounded-full bg-white border-[3px] border-[#34C759] flex items-center justify-center">
                <Check size={36} color="#34C759" strokeWidth={3} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-6 pt-6">
            <h2 className="text-[20px] font-bold text-[#1A1A2E] mb-2 text-center">
              {"¡Felicidades!"}
            </h2>
            <p className="text-[15px] text-[#8E8E93] text-center mb-8">
              Has completado con éxito el curso {selectedCourse?.title}.
            </p>

            {/* Credits reward card */}
            <div className="w-full bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E8B230]/30 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-[48px] h-[48px] rounded-2xl bg-[#FFF5E0] flex items-center justify-center shrink-0">
                  <Gift size={24} color="#E8B230" />
                </div>
                <div>
                  <p className="text-[13px] text-[#8E8E93]">Ganaste</p>
                  <p className="text-[24px] font-bold text-[#E8B230] leading-none">+{rewardResult.credits_earned} creditos</p>
                </div>
              </div>
              <div className="h-px bg-[#F2F3F7] my-4" />
              <div className="flex justify-between">
                <span className="text-[13px] text-[#8E8E93]">Nuevo saldo</span>
                <span className="text-[15px] font-bold text-[#4B5EAA]">{rewardResult.new_balance} creditos</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3 mt-auto pb-8">
              <button
                onClick={() => router.push("/perks")}
                className="w-full h-[50px] bg-[#4B5EAA] text-white rounded-2xl text-[16px] font-semibold active:scale-[0.98] transition-transform"
              >
                Usar mis creditos
              </button>
              <button
                onClick={() => { setScreen("list"); setLessonChecked(false); }}
                className="w-full h-[50px] text-[#4B5EAA] text-[16px] font-semibold active:scale-[0.98] transition-transform"
              >
                Volver a mis cursos
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== LESSON SCREEN =====
  if (screen === "lesson" && selectedCourse) {
    const paragraphs = selectedCourse.lesson_content.split('\n\n')
    return (
      <div className="min-h-screen bg-[#F2F3F7] flex justify-center">
        <div className="w-full max-w-[420px] min-h-screen bg-white flex flex-col">
          <StatusBar />
          <div className="px-4 py-3 flex items-center justify-between border-b border-[#E5E5EA]">
            <button className="p-1" onClick={() => setScreen("detail")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="none" stroke="#1A1A2E" strokeWidth="1.5"/></svg>
            </button>
            <span className="text-[17px] font-semibold text-[#1A1A2E]">{selectedCourse.category.charAt(0).toUpperCase() + selectedCourse.category.slice(1)}</span>
            <button onClick={() => { setScreen("list"); setLessonChecked(false); }} className="text-[#1A1A2E]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-[3px] bg-[#E5E5EA]"><div className="h-full bg-[#4B5EAA]" style={{ width: lessonChecked ? '100%' : '50%' }} /></div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} color="#8E8E93" />
              <span className="text-[12px] text-[#8E8E93] uppercase tracking-wide font-medium">Lectura</span>
            </div>
            <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-5">{selectedCourse.lesson_title}</h2>

            <div className="space-y-4">
              {paragraphs.map((p, i) => {
                // Handle bold markdown
                const parts = p.split(/(\*\*[^*]+\*\*)/)
                return (
                  <p key={i} className="text-[14px] text-[#1A1A2E] leading-relaxed">
                    {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                      }
                      return <span key={j}>{part}</span>
                    })}
                  </p>
                )
              })}
            </div>
          </div>

          {/* Bottom action */}
          <div className="border-t border-[#E5E5EA] px-5 py-4 bg-white">
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  lessonChecked ? 'bg-[#4B5EAA] border-[#4B5EAA]' : 'border-[#D1D1D6]'
                }`}
                onClick={() => setLessonChecked(!lessonChecked)}
              >
                {lessonChecked && <Check size={14} color="white" strokeWidth={3} />}
              </div>
              <span className="text-[14px] text-[#1A1A2E]">Marca tu leccion como finalizada</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setScreen("detail")}
                className="flex-1 h-[48px] text-[#4B5EAA] text-[15px] font-semibold"
              >
                Volver
              </button>
              <button
                onClick={handleComplete}
                disabled={!lessonChecked || completing}
                className="flex-1 h-[48px] bg-[#4B5EAA] text-white rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {completing ? "Completando..." : "Continuar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== DETAIL SCREEN =====
  if (screen === "detail" && selectedCourse) {
    const isCompleted = completedIds.includes(selectedCourse.id)
    return (
      <div className="min-h-screen bg-[#F2F3F7] flex justify-center">
        <div className="w-full max-w-[420px] min-h-screen bg-[#F2F3F7] flex flex-col">
          <StatusBar />
          <div className="bg-white">
            <div className="px-4 py-3 flex items-center gap-3">
              <button onClick={() => setScreen("list")} className="p-1 -ml-1">
                <ChevronLeft size={24} color="#1A1A2E" />
              </button>
              <h1 className="text-[17px] font-semibold text-[#1A1A2E] truncate">{selectedCourse.title}</h1>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-[#E5E5EA]">
              <button className="flex-1 pb-3 pt-1 text-center relative">
                <span className="text-[14px] font-semibold text-[#4B5EAA]">Detalles</span>
                <div className="absolute bottom-0 left-4 right-4 h-[2.5px] bg-[#4B5EAA] rounded-full" />
              </button>
              <button className="flex-1 pb-3 pt-1 text-center" onClick={() => setScreen("lesson")}>
                <span className="text-[14px] text-[#8E8E93]">Contenido</span>
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="h-[200px] overflow-hidden">
            <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>

          <div className="flex-1 px-5 py-5">
            {/* Info banner */}
            <div className="bg-[#EDEDFC] rounded-2xl p-4 flex items-start gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#4B5EAA]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Gift size={16} color="#4B5EAA" />
              </div>
              <p className="text-[13px] text-[#1A1A2E]">
                Completa este curso y gana <strong className="text-[#E8B230]">{selectedCourse.credits_reward} creditos</strong> para tu wallet de Perks.
              </p>
            </div>

            <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-4">{selectedCourse.title}</h2>

            {/* Details card */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-4">
              <p className="text-[12px] text-[#8E8E93] uppercase tracking-wide font-medium mb-3">Detalles</p>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} color="#8E8E93" />
                <span className="text-[14px] text-[#1A1A2E]">Tipo: Lectura</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Gift size={14} color="#E8B230" />
                <span className="text-[14px] text-[#1A1A2E]">Recompensa: <strong className="text-[#E8B230]">{selectedCourse.credits_reward} creditos</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={14} color="#8E8E93" />
                <span className="text-[14px] text-[#1A1A2E]">Duración: 3 min</span>
              </div>
            </div>

            {/* Progress card */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <p className="text-[12px] text-[#8E8E93] uppercase tracking-wide font-medium mb-3">Progreso</p>
              <div className="h-2 bg-[#E5E5EA] rounded-full mb-2">
                <div className="h-full bg-[#4B5EAA] rounded-full transition-all" style={{ width: isCompleted ? '100%' : '0%' }} />
              </div>
              <p className="text-[13px] text-[#8E8E93]">{isCompleted ? '1/1' : '0/1'} leccion completada</p>
            </div>
          </div>

          {/* Bottom button */}
          <div className="px-5 pb-8">
            <button
              onClick={() => { setScreen("lesson"); setLessonChecked(false); }}
              disabled={isCompleted}
              className="w-full h-[50px] bg-[#4B5EAA] text-white rounded-2xl text-[16px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              {isCompleted ? "Curso completado ✓" : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== LIST SCREEN =====
  return (
    <div className="min-h-screen bg-[#F2F3F7] flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-[#F2F3F7] flex flex-col">
        <div className="bg-white">
          <StatusBar />
          <div className="px-4 py-3 flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-1 -ml-1">
              <ChevronLeft size={24} color="#4B5EAA" />
            </button>
            <h1 className="text-[17px] font-semibold text-[#1A1A2E]">Aprendizaje</h1>
          </div>
        </div>

        <div className="flex-1 px-4 py-5">
          <p className="text-[13px] text-[#8E8E93] mb-1">¡Hola Maria!</p>
          <h2 className="text-[20px] font-bold text-[#1A1A2E] mb-5">Continua aprendiendo</h2>

          {courses.map((course) => {
            const isCompleted = completedIds.includes(course.id)
            return (
              <button
                key={course.id}
                onClick={() => { setSelectedCourse(course); setScreen("detail"); }}
                className="w-full bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-4 flex items-center gap-4 text-left active:bg-[#FAFAFA] transition-colors"
              >
                <div className="w-[80px] h-[60px] rounded-xl overflow-hidden shrink-0">
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1A1A2E] mb-2">{course.title}</p>
                  <div className="h-1.5 bg-[#E5E5EA] rounded-full mb-1">
                    <div className="h-full bg-[#4B5EAA] rounded-full" style={{ width: isCompleted ? '100%' : '0%' }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#8E8E93]">{isCompleted ? '1/1' : '0/1'} leccion</span>
                    <span className="text-[11px] font-semibold text-[#E8B230]">+{course.credits_reward} cr</span>
                  </div>
                </div>
                <ChevronRight size={18} color="#D1D1D6" />
              </button>
            )
          })}

          {/* Perks CTA */}
          <div className="bg-[#EDEDFC] rounded-2xl p-4 flex items-center gap-3 mt-4">
            <Gift size={20} color="#4B5EAA" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#1A1A2E]">Completa cursos, gana creditos</p>
              <p className="text-[11px] text-[#8E8E93]">Usalos en beneficios de Perks</p>
            </div>
            <button onClick={() => router.push("/perks")} className="text-[12px] font-semibold text-[#4B5EAA]">Ver Perks →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
