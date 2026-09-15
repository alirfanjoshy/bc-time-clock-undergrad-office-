import { MapPin, Navigation } from 'lucide-react';

const destination = encodeURIComponent('West Quad Center, Brooklyn College, 2900 Bedford Avenue, Brooklyn, NY 11210');
export function OfficeLocationCard() {
  return <section className="office-location">
    <header><span>FIND OUR OFFICE</span><h2><MapPin size={20} /> Office of Undergraduate Admissions</h2></header>
    <div className="office-location-body">
      <iframe title="Map showing West Quad Center at Brooklyn College" src={`https://www.google.com/maps?q=${destination}&z=17&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="office-location-details">
        <div><b className="office-room">Room 222</b><strong>West Quad Center</strong></div>
        <address>2900 Bedford Avenue<br />Brooklyn, NY 11210</address>
        <p>The map shows the building. Find Room 222 inside West Quad Center.</p>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${destination}`} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Get Directions</a>
      </div>
    </div>
  </section>;
}
