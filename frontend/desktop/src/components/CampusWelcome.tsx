import { ArrowRight, Clock3, ClipboardList, Users } from 'lucide-react';

type Props = { onLogIn: () => void; onSignUp: () => void };

export function CampusWelcome({ onLogIn, onSignUp }: Props) {
  return (
    <main className="campus-welcome">
      <header className="campus-welcome-nav">
        <a className="campus-wordmark" href="#" aria-label="Brooklyn College home">Brooklyn<br />College<span>THE CITY UNIVERSITY OF NEW YORK</span></a>
        <span className="campus-office">Undergraduate Recruitment Office</span>
        <nav aria-label="Account options">
          <button className="campus-login-link" onClick={onLogIn}>Log in</button>
          <button className="campus-signup" onClick={onSignUp}>Sign up <ArrowRight size={16} aria-hidden="true" /></button>
        </nav>
      </header>
      <section className="campus-welcome-hero" aria-labelledby="campus-heading">
        <img src={`${import.meta.env.BASE_URL}campus-login.jpg`} alt="A panoramic aerial view of Brooklyn College’s campus, green quad, and clock tower at sunset" fetchPriority="high" />
        <div className="campus-hero-shade" />
        <div className="campus-hero-copy">
          <span className="campus-eyebrow">OUR CAMPUS. OUR COMMUNITY.</span>
          <h1 id="campus-heading">A place to belong.<br />A team that makes<br className="campus-heading-break" /> a difference.</h1>
          <p>Welcome to the Undergraduate Recruitment Office. Your work helps connect future students with the Brooklyn College community.</p>
          <div className="campus-hero-actions">
            <button onClick={onLogIn}>Log in to Time Clock <ArrowRight size={18} aria-hidden="true" /></button>
            <button className="campus-secondary" onClick={onSignUp}>New here? Sign up</button>
          </div>
        </div>
        <span className="campus-photo-caption">BROOKLYN COLLEGE · BROOKLYN, NEW YORK</span>
      </section>
      <section className="campus-intro" aria-labelledby="campus-intro-heading">
        <div><span className="campus-eyebrow">YOUR WORKDAY, IN ONE PLACE</span><h2 id="campus-intro-heading">Supporting students.<br />Making every hour count.</h2></div>
        <p>BC Time Clock gives our recruitment team one place to clock in, review attendance, and prepare timesheets. Log in with your office account, or sign up to get started.</p>
      </section>
      <section className="campus-features" aria-label="Time Clock features">
        <article><Clock3 aria-hidden="true" /><h3>Start your day</h3><p>Clock in and out and keep track of your work hours.</p></article>
        <article><ClipboardList aria-hidden="true" /><h3>Stay on top of your time</h3><p>Review your shifts and download your timesheet reports.</p></article>
        <article><Users aria-hidden="true" /><h3>One connected team</h3><p>A shared workspace for recruitment employees and office administrators.</p></article>
      </section>
      <footer className="campus-welcome-footer"><span>Brooklyn College</span><p>Undergraduate Recruitment Office · BC Time Clock</p></footer>
    </main>
  );
}
