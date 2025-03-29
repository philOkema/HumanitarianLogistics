import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
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
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">ABOUT US</h2>
        
        <div className="max-w-4xl mx-auto">
          <section className="mb-10">
            <h3 className="text-lg font-medium mb-4 text-gray-900">Our Mission</h3>
            <p className="text-gray-700 mb-4">
              The Humanitarian Aid Distribution System (HADS) was founded to efficiently and transparently 
              distribute humanitarian aid to those in need by leveraging technology, ensuring equitable access, 
              and minimizing logistical challenges.
            </p>
            <p className="text-gray-700">
              We work with local and international partners to coordinate relief efforts in disaster-affected 
              areas, conflict zones, and regions experiencing acute poverty or food insecurity.
            </p>
          </section>
          
          <section className="mb-10">
            <h3 className="text-lg font-medium mb-4 text-gray-900">Our Vision</h3>
            <p className="text-gray-700">
              We envision a world where humanitarian assistance reaches all those in need quickly, 
              efficiently, and with dignity. By leveraging technology and data-driven approaches, 
              we aim to create a global, technology-driven aid distribution system that enhances transparency, 
              promotes fairness, and ensures timely assistance to vulnerable communities worldwide.
            </p>
          </section>
          
          <section className="mb-10">
            <h3 className="text-lg font-medium mb-5 text-gray-900">Our Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreValues.map((value, index) => (
                <div key={index} className="flex p-5 border border-gray-100 rounded-lg shadow-sm">
                  <div className="mr-4 flex-shrink-0">
                    {value.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{value.title}</h4>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-900">Our Team</h3>
            <p className="text-gray-700 mb-4">
              HADS is powered by a dedicated team of humanitarian professionals, technologists, 
              logistics experts, and volunteers committed to improving aid delivery systems worldwide.
            </p>
            <p className="text-gray-700">
              We collaborate with local governments, NGOs, community organizations, and donors to 
              ensure that our aid distribution efforts are coordinated, efficient, and responsive 
              to the specific needs of each community we serve.
            </p>
          </section>
          
          <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Get in Touch
            </h3>
            <p className="text-gray-700 mb-2">
              For partnerships, volunteer opportunities, or general inquiries:
            </p>
            <p className="font-medium">contact@hads.org | +1 (123) 456-7890</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;