import { Link } from 'react-router-dom'

export default function Header({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-50 flex items-center h-14" style={{ background: 'linear-gradient(90deg, #009246 0%, #009246 30%, #fff 30%, #fff 70%, #ce2b37 70%, #ce2b37 100%)' }}>
      <div className="flex-1" />
      <Link to="/" className="bg-white flex items-center gap-2.5 px-4 py-1.5 rounded-b-xl no-underline">
        <img src="/logoSUCOVI.jpeg" alt="SUCOVI" className="h-10 w-10 object-contain rounded-full" />
        <div>
          <h1 className="text-[15px] font-bold tracking-wide text-gray-800 leading-tight">{title}</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </Link>
      <div className="flex-1" />
    </header>
  )
}
