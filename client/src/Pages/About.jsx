import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Target, Users, Heart, Award, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-primary-500" />,
      title: 'Interactive Learning',
      description: 'Engaging video lessons, quizzes, and interactive content designed for students from Grade 1-10'
    },
    {
      icon: <Target className="w-8 h-8 text-primary-500" />,
      title: 'Real-World Impact',
      description: 'Complete environmental challenges that make a real difference in your community'
    },
    {
      icon: <Award className="w-8 h-8 text-primary-500" />,
      title: 'Gamification',
      description: 'Earn points, badges, and climb the leaderboard while learning about the environment'
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-500" />,
      title: 'Daily Missions',
      description: 'Get personalized daily tasks to keep you motivated and learning consistently'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      description: 'Environmental scientist with 10+ years of experience in education'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Curriculum',
      description: 'Former teacher passionate about making learning fun and engaging'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Lead Developer',
      description: 'Tech enthusiast building innovative educational solutions'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Students' },
    { number: '500+', label: 'Lessons' },
    { number: '50+', label: 'Badges' },
    { number: '100+', label: 'Challenges' }
  ];

  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Sustainability First',
      description: 'We believe in creating a sustainable future for the next generation'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Inclusive Learning',
      description: 'Education should be accessible and enjoyable for all students'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Real Impact',
      description: 'Learning should lead to real-world action and positive change'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            About EcoMinds
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to inspire the next generation of environmental champions 
            through engaging, gamified learning experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                EcoMinds was created to address two critical challenges: making environmental 
                education engaging for students and inspiring real-world action.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                We believe that learning about the environment shouldn't be boring. By combining 
                interactive lessons, gamification, and real-world challenges, we're creating a 
                new generation of students who don't just learn about environmental issues—they 
                take action to solve them.
              </p>
              <div className="space-y-3">
                {[
                  'Make environmental education fun and engaging',
                  'Inspire students to take real-world action',
                  'Track progress and celebrate achievements',
                  'Build a community of young environmental leaders'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-primary-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Leaf className="w-32 h-32 text-primary-600 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-gray-900">
                    Empowering Students
                  </p>
                  <p className="text-gray-600">
                    One lesson at a time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're not just another learning platform—we're a movement
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card text-center hover:scale-105 transition-transform"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate educators and developers working to change the world
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold mb-1 text-gray-900">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how students are making a difference
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-green-50 border-2 border-green-200">
              <div className="text-4xl mb-3">🌱</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
              <p className="text-gray-700">Trees planted by students</p>
            </div>
            <div className="card bg-blue-50 border-2 border-blue-200">
              <div className="text-4xl mb-3">♻️</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">100 tons</div>
              <p className="text-gray-700">Plastic waste recycled</p>
            </div>
            <div className="card bg-yellow-50 border-2 border-yellow-200">
              <div className="text-4xl mb-3">🌍</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25 countries</div>
              <p className="text-gray-700">Students from around the world</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Join the Movement
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of a community of students making a real difference
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;