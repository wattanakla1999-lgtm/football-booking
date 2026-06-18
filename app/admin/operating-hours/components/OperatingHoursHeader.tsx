export function OperatingHoursHeader() {
  return (
    <>
      <h2
        style={{
          fontSize: "1.05rem",
          fontWeight: 800,
          marginBottom: "0.4rem",
          color: "#ffffff",
        }}
      >
        ⚙️ ตั้งค่าเวลาทำการทั่วไป
      </h2>

      <p
        style={{
          fontSize: "0.8rem",
          color:
            "rgba(255,255,255,0.45)",
          marginBottom: "1.5rem",
        }}
      >
        แก้ไขเวลาเปิดและปิดให้บริการในแต่ละวันของสัปดาห์
        หากเลือกปิดให้บริการ
        ระบบจะปิดรับจองในวันดังกล่าวทันที
      </p>
    </>
  );
}
