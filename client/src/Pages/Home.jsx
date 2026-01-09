import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Trophy, Users, Zap, ArrowRight } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-primary-500" />,
      title: 'Interactive Lessons',
      description: 'Learn about environment through engaging video lessons and interactive content'
    },
    {
      icon: <Trophy className="w-8 h-8 text-primary-500" />,
      title: 'Gamification',
      description: 'Earn points, badges, and climb the leaderboard while learning'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-500" />,
      title: 'Real-world Challenges',
      description: 'Complete environmental challenges and make a real impact'
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-500" />,
      title: 'Daily Missions',
      description: 'Get daily tasks to keep you motivated and learning consistently'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Students' },
    { number: '500+', label: 'Lessons' },
    { number: '50+', label: 'Badges' },
    { number: '100+', label: 'Challenges' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 leading-tight">
                Learn, Play,
                <span className="text-primary-600"> Save the Planet!</span>
              </h1>
              <p className="text-xl text-gray-600">
                Join thousands of students learning about environmental science through
                interactive lessons, quizzes, and real-world challenges.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="btn btn-primary text-lg px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="btn btn-secondary text-lg px-8 py-3"
                >
                  Learn More
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">10,000+</span> students already learning
                </p>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                <img
                  src="/assets/images/hero-illustration.svg"
                  alt="EcoMinds Learning"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2322c55e' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='24' font-family='Arial'%3EEcoMinds%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-50" />
              <div className="absolute -top-6 -left-6 w-48 h-48 bg-primary-300 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
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
              Why Choose EcoMinds?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learning about the environment has never been this fun and engaging
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

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start your learning journey in 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account in seconds' },
              { step: '2', title: 'Learn & Play', desc: 'Complete lessons, quizzes, and challenges' },
              { step: '3', title: 'Earn Rewards', desc: 'Collect points, badges, and climb the leaderboard' }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-8 w-8 h-8 text-primary-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students making a difference while learning
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;