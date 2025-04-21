import React from 'react';
import { Heart, Globe, Users, Shield, MessageSquare } from 'lucide-react';

const AboutPage = () => {
  const coreValues = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Compassion',
      description: 'We approach our work with empathy and care for the dignity of those we serve.'
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: 'Global Reach',
      description: 'Our network spans across continents to deliver aid wherever it is needed most.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Community Focus',
      description: 'We believe in empowering communities to participate in their own recovery and development.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Accountability',
      description: 'We maintain transparency in our operations and responsible stewardship of resources.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">About Us</h2>
          
          <div className="max-w-4xl mx-auto">
            <section className="mb-10">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Our Mission</h3>
              <p className="text-gray-700 mb-4 text-lg">
                The Humanitarian Aid Distribution System (HADS) was founded to efficiently and transparently 
                distribute humanitarian aid to those in need by leveraging technology, ensuring equitable access, 
                and minimizing logistical challenges.
              </p>
              <p className="text-gray-700 text-lg">
                We work with local and international partners to coordinate relief efforts in disaster-affected 
                areas, conflict zones, and regions experiencing acute poverty or food insecurity.
              </p>
            </section>
            
            <section className="mb-10">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Our Vision</h3>
              <p className="text-gray-700 text-lg">
                We envision a world where humanitarian assistance reaches all those in need quickly, 
                efficiently, and with dignity. By leveraging technology and data-driven approaches, 
                we aim to create a global, technology-driven aid distribution system that enhances transparency, 
                promotes fairness, and ensures timely assistance to vulnerable communities worldwide.
              </p>
            </section>
            
            <section className="mb-10">
              <h3 className="text-2xl font-semibold mb-5 text-gray-900">Our Core Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coreValues.map((value, index) => (
                  <div key={index} className="flex p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="mr-4 flex-shrink-0">
                      {value.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-lg">{value.title}</h4>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Our Team</h3>
              <p className="text-gray-700 mb-4 text-lg">
                HADS is powered by a dedicated team of humanitarian professionals, technologists, 
                logistics experts, and volunteers committed to improving aid delivery systems worldwide.
              </p>
              <p className="text-gray-700 text-lg">
                We collaborate with local governments, NGOs, community organizations, and donors to 
                ensure that our aid distribution efforts are coordinated, efficient, and responsive 
                to the specific needs of each community we serve.
              </p>
            </section>
            
            <div className="mt-8 p-8 bg-gray-50 rounded-lg border border-gray-100 text-center">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center text-xl">
                <MessageSquare className="h-6 w-6 mr-2 text-primary" />
                Get in Touch
              </h3>
              <p className="text-gray-700 mb-3 text-lg">
                For partnerships, volunteer opportunities, or general inquiries:
              </p>
              <p className="font-medium text-lg">contact@hads.org | +1 (123) 456-7890</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;