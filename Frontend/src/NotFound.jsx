import React from 'react'

function NotFound() {
  return (
    <div>
        <section className='h-[calc(100vh-5rem)] flex items-center justify-center'>
            <div>
                <h1>404</h1>
                <p>Page Not Found</p>
                <button>Go to Home</button>
            </div>
        </section>
    </div>
  )
}

export default NotFound