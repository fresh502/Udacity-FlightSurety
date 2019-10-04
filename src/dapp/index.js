import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
import { flights } from './config.json';

(async() => {
    const contract = new Contract('localhost', () => {

        // Read transaction & Display flights for purchasing insurance
        contract.isOperational((error, result) => {
            display('Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', error: error, value: result}]);
        });
    
        // Choose from a fixed list of flight numbers and departure. Purchase flight insurance
        const data = flights.map((flight, index) => {
            return { index: (index + 1).toString(), value: `${flight.number} / ${new Date(flight.timestamp * 1000)}` }
        })
        displayFlight('Flights', 'Select flight and purchase insurance', data);
        
        DOM.elid('purchase-insurance').addEventListener('click', () => {
            const flightAndNumber = DOM.elid('flight-number-timestamp').value;
            if (!flightAndNumber) return alert('Select flight first');

            const [flight, flightDate] = flightAndNumber.split('/');
            const timestamp = new Date(flightDate).getTime();
            const amount = DOM.elid('insurance-amount').value;
            if (!amount) return alert('Input amount');

            contract.purchaseInsurance(flight, timestamp, amount, (error) => {
                console.error(error);
            });
        })

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            const flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    
    });

})();

function display(title, description, results) {
    const displayDiv = DOM.elid("is-operational");
    const section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-2 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}

function displayFlight(title, description, results) {
    const displayDiv = DOM.elid("flight-number-timestamp-selection");
    const section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    const row = section.appendChild(DOM.select({ id: 'flight-number-timestamp' }));
    row.appendChild(DOM.option({ label: '======== Select flight to purchase insurance =========' }));
    results.map((result) => {
        row.appendChild(DOM.option({ value: result.value }, `${result.index}. ${result.value}` ));
    })
    displayDiv.append(section);
}







