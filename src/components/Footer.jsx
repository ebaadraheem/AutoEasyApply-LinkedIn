// Footer Component
function Footer() {
  return (
    <footer className="bg-slate-900 text-center py-6 mt-12 border-t border-slate-700">
      <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} UserVault. All rights reserved.</p>
      <p className="text-xs text-slate-500 mt-1">Powered by React, Tailwind CSS, MongoDB and Express.js.</p>
    </footer>
  );
}
export default Footer;