import PageContainer from '../layout/PageContainer.jsx'

/**
 * ProblemSection
 * ----------------------------------------------------------------
 * Landing page section explaining the gap FutureHealth addresses.
 * Purely presentational.
 * ----------------------------------------------------------------
 */
export default function ProblemSection() {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer className="max-w-3xl text-center">
        <h2 className="section-title">Tahu Pentingnya Sehat, Tapi Sulit Membayangkan Dampaknya?</h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-500">
          Banyak orang mengetahui pentingnya hidup sehat, namun sulit memahami bagaimana
          keputusan kecil setiap hari dapat memengaruhi kesehatan mereka dalam jangka panjang.
        </p>
        <p className="mt-3 text-lg leading-relaxed text-slate-500">
          <span className="font-semibold text-emerald-600">FutureHealth</span> hadir untuk
          menjembatani kesenjangan tersebut melalui simulasi kesehatan masa depan.
        </p>
      </PageContainer>
    </section>
  )
}
