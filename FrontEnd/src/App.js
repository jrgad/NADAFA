import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import QRPDFApp from './ScannerPage';
import './App.css';
import Login from './Login';

// --- Static Ticket Data ---
const ticketsDataArray = [
  {
    number: 1,
    header: 'Main Registration',
    id: 'TC-2025-0420',
    date: 'May 1, 2025',
    place: 'lecture hall',
    time: '9:00 AM - 5:00 PM',
    qrValue: 'TC-2025-0420-TICKET-001',
    moderator: 'Dr. Ahmed Hassan',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 2,
    header: 'High-risk pregnancy for Congenital Birth Defects',
    id: 'MF-2025-0715',
    date: 'May 1, 2025',
    place: 'Small Theater',
    time: '9:30 - 11:00',
    qrValue: 'MF-2025-0715-TICKET-002',
    moderator: 'Prof. Rehab Elsaeed',
    spreadsheetId: '1JAnWQI9W8foN-3DKnu1LxSl_vdq76dF1tW6Rf009B3g'
  },
  {
    number: 3,
    header: 'Updates in Wound Care (Pre – During – Post wound care)',
    id: 'AE-2025-0901',
    date: 'May 1, 2025',
    place: 'Lecture Hall',
    time: '9:30 - 11:00',
    qrValue: 'AE-2025-0901-TICKET-003',
    moderator: 'Dr. Fatma Hussien',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 4,
    header: 'Longterm Outcome of Bladder Exstrophy Management ',
    id: 'AE-2025-1010',
    date: 'May 1, 2025',
    place: 'Small Theater',
    time: '11:15 - 1:00',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Amr Kamal & Dr. Mohamed Mansy ',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 5,
    header: 'Psychosocial Impact of Congenital Anomalies on Children and Families',
    id: 'AE-2025-1010',
    date: 'May 1, 2025',
    place: 'Lecture Hall',
    time: '11:15 - 1:00',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Prof. Marwa Saeed',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 6,
    header: 'Transational Care in Congential Anomalies ',
    id: 'AE-2025-1010',
    date: 'May 1, 2025',
    place: 'Small Theater',
    time: '2:00 - 3:30',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Mohamed Abdelmalak & Dr. Mustafa Zein',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 7,
    header: 'Medication Error in Paediatrics',
    id: 'AE-2025-1010',
    date: 'May 1, 2025',
    place: 'Lecture Hall',
    time: '2:00 - 3:30',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Maram Sakr (pharmacy)',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 8,
    header: 'Vascular Birth Defects',
    id: 'AE-2025-1010',
    date: 'May 1, 2025',
    place: 'Small Theater',
    time: '3:45 - 5:15',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Prof . Amr Zaki ',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 9,
    header: 'Pain Management in Pediatrics',
    id: 'AE-2025-1010',
    date: 'May 1, 2025',
    place: 'Lecture Hall',
    time: '3:45 - 5:15',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Ahmed Nozahy (Medical ) and Prof. Marwa Abou heba (nursing)',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 10,
    header: 'Liver Transplant: Challenges, Innovations, and Long-Term Outcomes',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Small Theater',
    time: '9:00 - 11:00',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Ibrahim fathy / Dr. Wessam Saeed (Abstract Presentation) ',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 11,
    header: 'Advances in Management of Congenital Anomalies Patients (Abstract)',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Lecture Hall',
    time: '9:00 - 10:00',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: '',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 12,
    header: 'Urodynamics in neuro-urological birth defects ',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Small Theater',
    time: '11:15 - 1:15',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Mohamed Mansy / Dr.Amr Kamal ',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 13,
    header: 'AI and Telemedicine: Coping with the Rapidly Changing World',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Lecture Hall',
    time: '10:00 - 11:30',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Fawzia Alsherif & Dr Mohamed Abdelmalak',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 14,
    header: 'Nutrition Care of Congenital Anomalies Patients (Post & Pre)',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Lecture Hall',
    time: '11:30 - 1:00',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Rita Dawood',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 15,
    header: 'Minimal Invasive Surgery For Congential Anomalies ( Video Abstract ) ',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Small Theatre',
    time: '2:00 - 4:00',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr.Hany Attallah ',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 16,
    header: 'Integrated Pediatric Cardiac Critical Care: Surgery, Catheterization, and Bedside Dialysis',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Lecture Hall',
    time: '2:00 - 4:00',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Ahmed Tharwat',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 17,
    header: 'Abstract submissions',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Small Theatre',
    time: '4:00 - 5:30',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: '',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
  {
    number: 18,
    header: 'From Anesthesia to Surgery: Coordinated Care in Pediatric Cardiac Interventions. ',
    id: 'AE-2025-1010',
    date: 'May 2, 2025',
    place: 'Lecture Hall',
    time: '4:00 - 5:30',
    qrValue: 'AE-2025-1010-TICKET-004',
    moderator: 'Dr. Mahmoud Nader',
    spreadsheetId: '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4'
  },
 
];

// --- Main App Component (Refactored) ---
function TicketList() {
  const navigate = useNavigate();

  const handleScanClick = (ticket) => {
    navigate('/scanner', { 
      state: { 
        spreadsheetId: ticket.spreadsheetId,
        qrValue: ticket.qrValue
      } 
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CAICC Registration App</h1>
      </header>
      <main>
        <div className="tickets-container">
          {ticketsDataArray.map((ticket) => (
            <div key={ticket.number} className="ticket">
              <div className="ticket-number">{ticket.number}</div>
              <div className="ticket-content">
                <h2>{ticket.header}</h2>
                <p className="event-id">Event #{ticket.id}</p>
                <div className="event-details">
                  <span>{ticket.date}</span> |
                  <span>{ticket.place}</span> |
                  <span>{ticket.time}</span>
                </div>
                <div className="moderator-details">
                  {ticket.moderator ? (
                    <>
                      <strong>Moderator:</strong> {ticket.moderator}
                    </>
                  ) : (
                    <em>No moderator assigned</em>
                  )}
                </div>
                <div className="divider"></div>
                <div className="scan-button-container">
                  <button 
                    onClick={() => handleScanClick(ticket)} 
                    className="scan-button"
                  >
                    Scan QR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route 
            path="/tickets" 
            element={
              <>
                <TicketList />
                <footer className="footer">
                  <div className="footer-content">
                    <div className="powered-by">
                      <p>Powered by</p>
                      <img src={require('./logo english.png')} alt="Company Logo" className="footer-logo" />
                    </div>
                  </div>
                </footer>
              </>
            } 
          />
          <Route path="/scanner" element={<QRPDFApp />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;