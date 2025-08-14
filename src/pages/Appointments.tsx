import React, { useState } from 'react';
import { Mail, Clock, Award, Star, User } from 'lucide-react';

const AppointmentsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('therapists');

  const therapists = [
    {
      id: 1,
      name: "Dr. Sarah Mitchell",
      specialty: "Family Systems Therapy",
      skills: ["Conflict Resolution", "Communication Patterns", "Intergenerational Trauma"],
      experience: "12 years",
      rating: 4.9,
      image: "/api/placeholder/120/120",
      bio: "Specializes in helping families navigate complex relationships and develop healthy communication patterns across generations."
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Child & Adolescent Psychology",
      skills: ["Teen Behavior", "Parent-Child Dynamics", "Educational Support"],
      experience: "8 years",
      rating: 4.8,
      image: "/api/placeholder/120/120",
      bio: "Expert in adolescent development and helping families manage transitions during teenage years and young adulthood."
    },
    {
      id: 3,
      name: "Dr. Elena Rodriguez",
      specialty: "Couples & Family Mediation",
      skills: ["Divorce Mediation", "Co-parenting", "Blended Families"],
      experience: "15 years",
      rating: 4.9,
      image: "/api/placeholder/120/120",
      bio: "Focuses on peaceful resolution of family conflicts and creating sustainable co-parenting arrangements."
    }
  ];

  const wealthManagers = [
    {
      id: 4,
      name: "James Thompson, CFP",
      specialty: "Multi-Generational Wealth Planning",
      skills: ["Estate Planning", "Trust Management", "Tax Optimization"],
      experience: "18 years",
      rating: 4.8,
      image: "/api/placeholder/120/120",
      bio: "Helps families preserve and transfer wealth across generations while maintaining family harmony and values."
    },
    {
      id: 5,
      name: "Amanda Foster, CFA",
      specialty: "Family Investment Strategy",
      skills: ["Portfolio Management", "Risk Assessment", "Financial Education"],
      experience: "14 years",
      rating: 4.9,
      image: "/api/placeholder/120/120",
      bio: "Specializes in creating investment strategies that align with family goals and teaching financial literacy to next generation."
    },
    {
      id: 6,
      name: "Robert Kim, JD, CFP",
      specialty: "Family Business Succession",
      skills: ["Business Valuation", "Succession Planning", "Governance Structures"],
      experience: "22 years",
      rating: 4.7,
      image: "/api/placeholder/120/120",
      bio: "Expert in transitioning family businesses to the next generation while maintaining both profitability and family relationships."
    }
  ];

  const currentProfessionals = selectedCategory === 'therapists' ? therapists : wealthManagers;

  const bookAppointment = (professional) => {
    const subject = encodeURIComponent(`Appointment Request with ${professional.name}`);
    const body = encodeURIComponent(`Hello ${professional.name},

I found your profile through the Shared Family Path platform and would like to book an appointment to discuss ${professional.specialty.toLowerCase()}.

My family is particularly interested in your expertise with:
${professional.skills.map(skill => `• ${skill}`).join('\n')}

Could we schedule a consultation to discuss how you might help us? I'm flexible with timing and can accommodate your schedule.

Looking forward to hearing from you.

Best regards,
[Your Name]
[Your Phone Number]`);

    window.location.href = `mailto:test@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F6F8' }}>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#001F3F' }}>
            Professional Appointments
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Connect with trusted professionals who specialize in supporting families through important conversations, 
            decisions, and transitions. Our carefully selected experts understand the unique dynamics of family relationships.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Selection */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedCategory('therapists')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'therapists'
                  ? 'text-white shadow-md hover:opacity-90'
                  : 'bg-white text-gray-600 hover:shadow-sm'
              }`}
              style={{
                backgroundColor: selectedCategory === 'therapists' ? '#001F3F' : 'white',
              }}
            >
              Family Therapists
            </button>
            <button
              onClick={() => setSelectedCategory('wealth-managers')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'wealth-managers'
                  ? 'text-white shadow-md hover:opacity-90'
                  : 'bg-white text-gray-600 hover:shadow-sm'
              }`}
              style={{
                backgroundColor: selectedCategory === 'wealth-managers' ? '#001F3F' : 'white',
              }}
            >
              Wealth Managers
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#001F3F' }}>
              {selectedCategory === 'therapists' ? 'Family Therapists' : 'Wealth Managers'}
            </h2>
            <p className="text-gray-600">
              {selectedCategory === 'therapists' 
                ? 'Mental health professionals who understand family dynamics and can help navigate difficult conversations.'
                : 'Financial experts who specialize in multi-generational wealth planning and family financial harmony.'
              }
            </p>
          </div>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProfessionals.map((professional) => (
            <div
              key={professional.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: '#001F3F' }}>
                    {professional.name}
                  </h3>
                  <p className="text-sm font-medium mb-2" style={{ color: '#002FA7' }}>
                    {professional.specialty}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {professional.experience}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {professional.rating}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {professional.bio}
              </p>

              {/* Skills */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4" style={{ color: '#002FA7' }} />
                  <span className="text-sm font-medium" style={{ color: '#001F3F' }}>
                    Key Expertise
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {professional.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full text-gray-600 border border-gray-200"
                      style={{ backgroundColor: '#F5F6F8' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Book Appointment Button */}
              <button
                onClick={() => bookAppointment(professional)}
                className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:opacity-90"
                style={{ backgroundColor: '#001F3F' }}
              >
                <Mail className="w-4 h-4" />
                Book Appointment
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2" style={{ color: '#001F3F' }}>
              Why Choose Our Network?
            </h3>
            <p className="text-gray-600 text-sm">
              All professionals in our network have been carefully selected for their expertise in family dynamics 
              and their understanding of the complex relationships that shape family decisions. They're committed 
              to supporting families with warmth, professionalism, and confidentiality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;