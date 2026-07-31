import React from 'react';

export function App() {
  return (
    <div className="app-shell">
      <header className="brand-header">
        <a className="brand-wordmark" href="/" aria-label="Reallymoving assessment home">
          <span>really</span><strong>moving</strong>
        </a>
      </header>
      <main className="starter" id="main-content">
        <p className="eyebrow">Front-End Engineering Assessment</p>
        <h1>Build the removal-company comparison experience</h1>
        <p>
          The project tooling, Reallymoving-inspired design tokens and mock REST API are ready. The
          application architecture, customer journey, state management and production UI are yours to design.
        </p>
        <section className="starter-card" aria-labelledby="getting-started">
          <h2 id="getting-started">Start here</h2>
          <ol>
            <li>Read the assessment pack and repository guidance.</li>
            <li>Review the API contract under <code>docs/api</code>.</li>
            <li>Replace this starter screen with your implementation.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
