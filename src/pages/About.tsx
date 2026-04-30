import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8">About Avbora</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-blue-500 mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              Avbora is an AI-powered platform designed to aggregate global opportunities—jobs, freelancing, scholarships, online income, and projects—and personalize them for every individual. We aim to break down the barriers to opportunity discovery by intelligently matching people with roles and funding they are uniquely qualified for.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-500 mb-4">The Problem We Solve</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              Finding the right opportunity is overwhelming. Talent is globally distributed, but opportunity is often hidden behind fragmented job boards, complex scholarship portals, and disconnected freelance marketplaces. People spend countless hours searching and filtering, often missing out on the perfect match.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-500 mb-4">The Avbora Vision</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              We envision a unified ecosystem where your skills, location, and ambition are analyzed by AI to proactively deliver opportunities directly to you. From guided application assistance to curated scholarship alerts, Avbora serves as your personal career and growth advisor.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
