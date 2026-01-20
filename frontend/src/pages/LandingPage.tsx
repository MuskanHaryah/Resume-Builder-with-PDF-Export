import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, CheckCircle2, Download, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-luna">
      {/* Header */}
      <header className="container-custom py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-luna-200" />
            <h1 className="text-2xl font-bold text-luna-500">Resume Builder</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container-custom py-12 md:py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold text-luna-500 mb-6">
            Build Your ATS-Optimized Resume
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-4">
            Create professional resumes that pass ATS filters and get you interviews
          </p>
          <p className="text-lg text-luna-300 font-medium">
            95%+ ATS Pass Rate • Professional Templates • Instant PDF Download
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Manual Mode Card */}
          <div
            onClick={() => navigate('/builder/manual')}
            className="card-interactive group cursor-pointer"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-luna-100/30 rounded-lg group-hover:bg-luna-200 transition-colors">
                <FileText className="w-8 h-8 text-luna-300 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-luna-500 mb-2">Build Manually</h3>
                <p className="text-gray-600">Fill form, preview, and download</p>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Simple and straightforward</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Complete control over content</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Live preview as you type</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Generic ATS score evaluation</span>
              </li>
            </ul>

            <button className="btn-primary w-full">
              Get Started →
            </button>
          </div>

          {/* AI-Assisted Mode Card */}
          <div
            onClick={() => navigate('/builder/ai')}
            className="card-interactive group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <span className="badge badge-primary animate-pulse">
                <Sparkles className="w-4 h-4 mr-1" />
                AI-Powered
              </span>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-luna-200 to-luna-300 rounded-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-luna-500 mb-2">AI-Assisted Build</h3>
                <p className="text-gray-600">Upload job description, get smart suggestions</p>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Extract keywords from job posting</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>AI-generated suggestions per field</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Auto-populated skills from JD</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Job-specific ATS optimization</span>
              </li>
            </ul>

            <button className="btn-primary w-full bg-gradient-to-r from-luna-200 to-luna-300">
              Get Started with AI →
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-luna-500 mb-8">
            Why Choose Our Resume Builder?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-luna-100/30 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-luna-300" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-luna-500">ATS-Optimized</h4>
              <p className="text-gray-600">
                Professional formatting that passes 95%+ of ATS systems
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-luna-100/30 rounded-full mb-4">
                <Download className="w-8 h-8 text-luna-300" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-luna-500">Instant Download</h4>
              <p className="text-gray-600">
                Download your resume as PDF with one click
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-luna-100/30 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-luna-300" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-luna-500">AI-Powered</h4>
              <p className="text-gray-600">
                Smart suggestions tailored to job descriptions
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container-custom py-8 border-t border-gray-200 mt-16">
        <div className="text-center text-gray-600">
          <p>© 2026 Resume Builder. Build professional resumes with confidence.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
