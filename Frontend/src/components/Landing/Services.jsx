
const servicesData = [
  {
    title: "Service 1",
    description: "Description of service 1. This could include details about what the service entails and its benefits.",
  },
  {
    title: "Service 2",
    description: "Description of service 2. Highlight the key features and advantages of this service.",
  },
  {
    title: "Service 3",
    description: "Description of service 3. Explain how this service can help solve customer problems.",
  },
  {
    title: "Service 4",
    description: "Description of service 4. Provide insights into what makes this service unique.",
  },
];

export default function Services() {
  return (
    <div>
      <h1 className='text-center text-4xl text-orange-500 font-semibold my-10'>Our Services</h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'>
        {servicesData.map((service, index) => (
          <div key={index} className='bg-gray-900 hover:bg-gray-800 shadow-md rounded-lg p-6 text-center transition-transform transform hover:scale-105'>
            <h2 className='text-xl font-bold mb-2 text-orange-600'>{service.title}</h2>
            <p className=''>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
