export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
      <p className="text-gray-400 mb-8">Have questions or feedback? We'd love to hear from you.</p>
      <form className="space-y-4">
        <input type="text" placeholder="Name" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl" />
        <input type="email" placeholder="Email" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl" />
        <textarea placeholder="Message" rows={4} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl"></textarea>
        <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">Send Message</button>
      </form>
    </div>
  );
}