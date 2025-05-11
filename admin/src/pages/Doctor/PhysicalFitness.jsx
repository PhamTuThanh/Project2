import React, { useEffect, useState } from "react";
import axios from "axios";

// Hàm tính toán các chỉ số (bạn cần thay bằng công thức thực tế)
function calculateZScoreCC(height) {
  const standard = 169.9; // trung bình chiều cao sinh viên 
  const sd = 5.7; // độ lệch chuẩn 
  return height ? ((height - standard) / sd).toFixed(2) : "";
}
function calculateZScoreCN(weight) {
  const standard = 62.3; // trung bình cân nặng sinh viên 
  const sd = 10.2; // độ lệch chuẩn 
  return weight ? ((weight - standard) / sd).toFixed(2) : "";
}
//BMI
function calculateBMI(weight, height) {
  if (weight === "" || height === "") return "";
  const heightInMeters = height / 100;
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
  return bmi;
}
function getDanhGiaCC(zScore) {
  if (zScore === "") return "";
  const z = parseFloat(zScore);
  if (z < -2) return "Thấp Còi Nhẹ";
  if (z < -1) return "Thấp Còi";
  if (z < 1) return "Bình Thường";
  return "Rất Cao";
}
function getDanhGiaCN(zScore) {
  if (zScore === "") return "";
  const z = parseFloat(zScore);
  if (z < -3) return "Nhẹ Cân Nặng";
  if (z < -2) return "Nhẹ Cân";
  if (z < 1) return "Bình Thường";
  return "Nặng Cân";
}
function getDanhGiaBMI(bmi) {
  if (bmi === "") return "";
  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return "Gầy";
  if (18.5 < bmiValue && bmiValue < 22.9) return "Bình thường";
  if (22.9 < bmiValue && bmiValue < 24.9) return "Thừa cân";
  if (24.9 < bmiValue && bmiValue < 29.9) return "Béo phì độ I";
  if (29.9 < bmiValue && bmiValue < 30) return "Béo phì độ II";
  return "Béo phì độ III";
}
function getDanhGiaTTH(systolic, diastolic) {
  if (systolic === "" || diastolic === "") return "";
  const systolicValue = parseFloat(systolic);
  const diastolicValue = parseFloat(diastolic);
  if (systolicValue < 120 || diastolicValue < 80) return "HAT";//Huyet Ap Thap
  if (systolicValue > 140 || diastolicValue > 90) return "HAC";//Huyet Ap Cao
  return "HABT";//Huyet Ap Binh Thuong
}
function getDanhGiaHeartRate(heartRate) {
  if (heartRate === "") return "";
  const heartRateValue = parseFloat(heartRate);
  if (heartRateValue < 60) return "NTT";
  if (heartRateValue > 100) return "NTC";
  return "NTBT";
}


export default function PhysicalFitness() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Lấy danh sách sinh viên
    axios.get("http://localhost:9000/api/students").then((res) => {
      if (res.data.success) {
        // Lấy dữ liệu sức khỏe
        axios.get("http://localhost:9000/api/doctor/physical-fitness").then((res2) => {
          const fitnessData = res2.data.data; // [{studentId, ...}]
          // Ghép dữ liệu sức khỏe vào từng sinh viên
          const rows = res.data.students.map((s) => {
            const fit = fitnessData.find(f => f.studentId === s._id);
            return {
              ...s,
              followDate: fit?.followDate || "",
              height: fit?.height || "",
              weight: fit?.weight || "",
              zScoreCC: fit?.zScoreCC || "",
              danhGiaCC: fit?.danhGiaCC || "",
              zScoreCN: fit?.zScoreCN || "",
              danhGiaCN: fit?.danhGiaCN || "",
              zScoreCNCc: fit?.zScoreCNCc || "",
              bmi: fit?.bmi || "",
              danhGiaBMI: fit?.danhGiaBMI || "",
              systolic: fit?.systolic || "",
              diastolic: fit?.diastolic || "",
              danhGiaTTH: fit?.danhGiaTTH || "",
              heartRate: fit?.heartRate || "",
              danhGiaHeartRate: fit?.danhGiaHeartRate || "",
            }
          });
          setRows(rows);
        });
      }
    });
  }, []);

  const handleChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;

    const height = parseFloat(newRows[idx].height) || 0;
    const weight = parseFloat(newRows[idx].weight) || 0;

    newRows[idx].zScoreCC = calculateZScoreCC(height);
    newRows[idx].danhGiaCC = getDanhGiaCC(newRows[idx].zScoreCC);
    newRows[idx].zScoreCN = calculateZScoreCN(weight);
    newRows[idx].danhGiaCN = getDanhGiaCN(newRows[idx].zScoreCN);
    newRows[idx].bmi = calculateBMI(weight, height);
    newRows[idx].danhGiaBMI = getDanhGiaBMI(newRows[idx].bmi);
    newRows[idx].danhGiaTTH = getDanhGiaTTH(newRows[idx].systolic, newRows[idx].diastolic);
    newRows[idx].danhGiaHeartRate = getDanhGiaHeartRate(newRows[idx].heartRate);
    newRows[idx].zScoreCNCc =
      newRows[idx].zScoreCN && newRows[idx].zScoreCC
        ? (parseFloat(newRows[idx].zScoreCN) - parseFloat(newRows[idx].zScoreCC)).toFixed(2)
        : "";

    setRows(newRows);
  };

  const handleSave = (idx) => {
    // Lưu từng dòng
    const row = rows[idx];
    axios
      .post("http://localhost:9000/api/doctor/physical-fitness", {
        studentId: row._id,
        followDate: row.followDate,
        height: row.height,
        weight: row.weight,
        zScoreCC: row.zScoreCC,
        danhGiaCC: row.danhGiaCC,
        zScoreCN: row.zScoreCN,
        danhGiaCN: row.danhGiaCN,
        zScoreCNCc: row.zScoreCNCc,
        bmi: row.bmi,
        danhGiaBMI: row.danhGiaBMI,
        systolic: row.systolic,
        diastolic: row.diastolic,
        danhGiaTTH: row.danhGiaTTH,
        heartRate: row.heartRate,
        danhGiaHeartRate: row.danhGiaHeartRate,
      })
      .then((res) => {
        alert(res.data.message);
      });
  };
  return (
    <div className="scale-[0.75] origin-top-left w-[133.33%]">
      <h2 className="mb-4 font-semibold text-lg">Nhập chỉ số sức khỏe học sinh</h2>
      <div className="bg-[#f6f7fa] p-6 rounded-xl overflow-hidden mx-auto max-w-[1400px]">
        <div className="overflow-x-auto">
          <table className="min-w-[1700px] w-full border-separate border-spacing-0 bg-white rounded-lg border border-[#eee]">
            <thead>
              <tr>
                <th className="min-w-[120px] text-center align-middle py-2 sticky left-0 z-10 bg-white border-r border-[#eee]">Họ và tên</th>
                <th className="min-w-[80px] text-center align-middle py-2 sticky left-[120px] z-10 bg-white border-r border-[#eee]">Giới tính</th>
                <th className="min-w-[100px] text-center align-middle py-2 sticky left-[200px] z-10 bg-white border-r border-[#eee]">Lớp</th>
                <th className="min-w-[120px] text-center align-middle py-2 border-r border-[#eee]">Ngày sinh</th>
                <th className="min-w-[120px] text-center align-middle py-2 border-r border-[#eee]">Ngày theo dõi</th>
                <th className="min-w-[120px] text-center align-middle py-2 border-r border-[#eee]">Chiều cao (cm)</th>
                <th className="min-w-[100px] text-center align-middle py-2 border-r border-[#eee]">Z-score CC</th>
                <th className="min-w-[100px] text-center align-middle py-2 border-r border-[#eee]">Đánh giá CC</th>
                <th className="min-w-[120px] text-center align-middle py-2 border-r border-[#eee]">Cân nặng (kg)</th>
                <th className="min-w-[100px] text-center align-middle py-2 border-r border-[#eee]">Z-score CN</th>
                <th className="min-w-[100px] text-center align-middle py-2 border-r border-[#eee]">Đánh giá CN</th>
                <th className="min-w-[120px] text-center align-middle py-2 border-r border-[#eee]">Z-score CN-CC</th>
                <th className="min-w-[120px] text-center align-middle py-2 border-r border-[#eee]">BMI</th>
                <th className="min-w-[100px] text-center align-middle py-2 border-r border-[#eee]">Đánh giá BMI</th>
                <th className="min-w-[80px] text-center align-middle py-2 border-r border-[#eee]">Tâm thu</th>
                <th className="min-w-[80px] text-center align-middle py-2 border-r border-[#eee]">Tâm trương</th>
                <th className="min-w-[80px] text-center align-middle py-2 border-r border-[#eee]">Đánh giá TTH</th>
                <th className="min-w-[80px] text-center align-middle py-2 border-r border-[#eee]">Nhịp tim</th>
                <th className="min-w-[80px] text-center align-middle py-2 ">Đánh giá nhịp tim</th>
                <th className="min-w-[80px] text-center align-middle py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row._id || idx} className="even:bg-[#f6f7fa]">
                  <td className="text-center align-middle py-2 sticky left-0 z-10 bg-white border-r border-[#eee]">{row.name}</td>
                  <td className="text-center align-middle py-2 sticky left-[120px] z-10 bg-white border-r border-[#eee]">{row.gender}</td>
                  <td className="text-center align-middle py-2 sticky left-[200px] z-10 bg-white border-r border-[#eee]">{row.cohort}</td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">{row.dob}</td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">
                    <input
                      type="date"
                      className="w-[120px] border rounded px-2 py-1"
                      value={row.followDate}
                      onChange={(e) => handleChange(idx, "followDate", e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">
                    <input
                      type="number"
                      className="w-[80px] border rounded px-2 py-1"
                      value={row.height}
                      onChange={(e) => handleChange(idx, "height", e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">{row.zScoreCC}</td>
                  <td className={`text-center align-middle py-2 border-r border-[#eee] ${row.danhGiaCC === "TCN" || row.danhGiaCC === "TCV" ? "text-red-500" : "text-blue-600"}`}>{row.danhGiaCC}</td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">
                    <input
                      type="number"
                      className="w-[80px] border rounded px-2 py-1"
                      value={row.weight}
                      onChange={(e) => handleChange(idx, "weight", e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">{row.zScoreCN}</td>
                  <td className={`text-center align-middle py-2 border-r border-[#eee] ${row.danhGiaCN === "NCN" || row.danhGiaCN === "NCV" ? "text-red-500" : "text-blue-600"}`}>{row.danhGiaCN}</td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">{row.zScoreCNCc}</td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">{row.bmi}</td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">{row.danhGiaBMI}</td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">
                    <input
                      type="number"
                      className="w-[70px] border rounded px-2 py-1"
                      value={row.systolic}
                      onChange={(e) => handleChange(idx, "systolic", e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">
                    <input
                      type="number"
                      className="w-[70px] border rounded px-2 py-1"
                      value={row.diastolic}
                      onChange={(e) => handleChange(idx, "diastolic", e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">{row.danhGiaTTH}</td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">
                    <input
                      type="number"
                      className="w-[70px] border rounded px-2 py-1"
                      value={row.heartRate}
                      onChange={(e) => handleChange(idx, "heartRate", e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle py-2 border-r border-[#eee]">{row.danhGiaHeartRate}</td>
                  <td className="text-center align-middle py-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" onClick={() => handleSave(idx)}>Lưu</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}