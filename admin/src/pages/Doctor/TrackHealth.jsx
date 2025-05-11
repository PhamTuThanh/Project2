import React, { useState } from 'react';

function TrackHealth() {
  const [specialist, setSpecialist] = useState('');
  const [fitness, setFitness] = useState('');
  const [abnormality, setAbnormality] = useState('');

  return (
    <div className="m-5 w-full max-w-xl">
      <p className="mb-4 text-lg font-medium">Track Health</p>
      <div className="flex flex-col gap-6 bg-white p-6 rounded border">
        <div>
          <label className="block mb-1 font-medium">Specialist consultation</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={specialist}
            onChange={e => setSpecialist(e.target.value)}
          >
            <option value="">-- Select Specialist --</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Orthopedic">Orthopedic</option>
            <option value="ENT">ENT</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Physical fitness</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={fitness}
            onChange={e => setFitness(e.target.value)}
          >
            <option value="">-- Select Fitness --</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Abnormality</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={abnormality}
            onChange={e => setAbnormality(e.target.value)}
          >
            <option value="">-- Select Abnormality --</option>
            <option value="None">None</option>
            <option value="Vision">Vision</option>
            <option value="Hearing">Hearing</option>
            <option value="Posture">Posture</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default TrackHealth;
