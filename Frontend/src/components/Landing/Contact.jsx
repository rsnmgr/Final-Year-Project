import React from 'react';

export default function Contact() {
  return (
    <div>
      <h1 className='text-center text-4xl text-orange-500 font-semibold my-10'>Get in Touch</h1>

      {/* Contact Form */}
      <div className='max-w-md mx-auto'>
        <form className='bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-4'>
          <h2 className='text-2xl text-center mb-6'>Contact Us</h2>
          
          <div className='mb-4'>
            <label className='block  text-sm font-bold mb-2' htmlFor='name'>
              Name
            </label>
            <input
              className='shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-900'
              id='name'
              type='text'
              placeholder='Your Name'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block  text-sm font-bold mb-2' htmlFor='email'>
              Email
            </label>
            <input
              className='shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-900'
              id='email'
              type='email'
              placeholder='Your Email'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block  text-sm font-bold mb-2' htmlFor='message'>
              Message
            </label>
            <textarea
              className='shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-900'
              id='message'
              placeholder='Your Message'
              rows='4'
              required
            />
          </div>

          <div className='flex'>
            <button
              className='bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline'
              type='submit'
            >
              Send Message
            </button>
          </div>
        </form>
      </div>

      {/* Footer Section */}
      <footer className='bg-gray-900 text-white py-6'>
        <div className='max-w-4xl mx-auto text-center'>
          <p className='text-sm'>© 2024 FOODS ME. All Rights Reserved.</p>
          <p className='text-sm'>Follow us on social media: 
            <a href="#" className='text-orange-500 hover:text-orange-400 mx-2'>Facebook</a> |
            <a href="#" className='text-orange-500 hover:text-orange-400 mx-2'>Twitter</a> |
            <a href="#" className='text-orange-500 hover:text-orange-400 mx-2'>Instagram</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
