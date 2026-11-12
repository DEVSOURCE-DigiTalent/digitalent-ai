import './pulse-loading.css';

/**
 * 1. SKELETON TRANG HÔM NAY (EM-01 - /enterprise/me)
 * Tái hiện chính xác Hero Banner chào hỏi, vòng tròn tiến độ Circular Ring, 4 thẻ Bento và danh sách nhiệm vụ.
 */
export function PulseTodaySkeleton() {
  return (
    <div className="pu-skel-today" role="status" aria-label="Đang tải trang Hôm nay">
      {/* 1. Hero Banner */}
      <div className="pu-skel-hero">
        <div className="pu-skel-hero-copy">
          <span className="pu-bone" style={{ width: 140, height: 14 }} />
          <span className="pu-bone" style={{ width: '80%', height: 32, borderRadius: 10 }} />
          <span className="pu-bone" style={{ width: '60%', height: 16 }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span className="pu-bone" style={{ width: 160, height: 42, borderRadius: 14 }} />
            <span className="pu-bone" style={{ width: 120, height: 42, borderRadius: 14 }} />
          </div>
        </div>
        <div className="pu-skel-hero-ring">
          <span className="pu-bone" style={{ width: 48, height: 20, borderRadius: 6 }} />
        </div>
      </div>

      {/* 2. Bento Quick Stat Cards */}
      <div className="pu-skel-stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="pu-skel-card pu-skel-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="pu-bone" style={{ width: '50%', height: 13 }} />
              <span className="pu-bone" style={{ width: 28, height: 28, borderRadius: 8 }} />
            </div>
            <span className="pu-bone" style={{ width: '70%', height: 28, borderRadius: 8 }} />
            <span className="pu-bone" style={{ width: '40%', height: 10 }} />
          </div>
        ))}
      </div>

      {/* 3. Action Center & Agenda Split */}
      <div className="pu-skel-split-2">
        <div className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="pu-bone" style={{ width: 180, height: 20 }} />
            <span className="pu-bone" style={{ width: 80, height: 14 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="pu-skel-row-item">
                <span className="pu-bone" style={{ width: 20, height: 20, borderRadius: 6 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="pu-bone" style={{ width: '65%', height: 14 }} />
                  <span className="pu-bone" style={{ width: '35%', height: 10 }} />
                </div>
                <span className="pu-bone" style={{ width: 70, height: 22, borderRadius: 999 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="pu-bone" style={{ width: 160, height: 20 }} />
          <div style={{ width: '100%', height: 160, display: 'grid', placeItems: 'center' }}>
            <span className="pu-bone" style={{ width: 130, height: 130, borderRadius: '50%' }} />
          </div>
          <span className="pu-bone" style={{ width: '80%', height: 12, margin: '0 auto' }} />
        </div>
      </div>
    </div>
  );
}

/**
 * 2. SKELETON TRANG LỘ TRÌNH (EM-02 - /enterprise/me/path)
 * Cây timeline lộ trình với các nút mốc cấp độ Cơ bản - Trung cấp - Nâng cao.
 */
export function PulsePathSkeleton() {
  return (
    <div className="pu-skel-path" role="status" aria-label="Đang tải Lộ trình năng lực">
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <span className="pu-bone" style={{ width: 110, height: 12, marginBottom: 8 }} />
          <span className="pu-bone" style={{ width: 260, height: 28, borderRadius: 8 }} />
        </div>
        <div className="pu-skel-tabs">
          {[80, 90, 100, 90].map((w, idx) => (
            <span key={idx} className="pu-bone" style={{ width: w, height: 36, borderRadius: 999 }} />
          ))}
        </div>
      </div>

      {/* Timeline Roadmap */}
      <div className="pu-skel-path-timeline">
        {[1, 2, 3].map((step) => (
          <div key={step} className="pu-skel-milestone">
            <div className="pu-bone pu-skel-node" />
            <div className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="pu-bone" style={{ width: 140, height: 14 }} />
                <span className="pu-bone" style={{ width: 90, height: 24, borderRadius: 999 }} />
              </div>
              <span className="pu-bone" style={{ width: '70%', height: 22, borderRadius: 6 }} />
              <span className="pu-bone" style={{ width: '90%', height: 13 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span className="pu-bone" style={{ width: '40%', height: 8, borderRadius: 999 }} />
                <span className="pu-bone" style={{ width: 110, height: 34, borderRadius: 12 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. SKELETON CHI TIẾT KHÓA HỌC (EM-05 - /enterprise/me/courses/:id)
 * Bố cục 2 cột: Danh sách mô-đun đề cương bên trái + Thẻ tổng kết nhập môn bên phải.
 */
export function PulseCourseDetailSkeleton() {
  return (
    <div className="pu-skel-course" role="status" aria-label="Đang tải Chi tiết khóa học">
      {/* Banner Khóa học */}
      <div className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="pu-bone" style={{ width: 120, height: 14 }} />
        <span className="pu-bone" style={{ width: '65%', height: 32, borderRadius: 8 }} />
        <span className="pu-bone" style={{ width: '85%', height: 14 }} />
        <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
          <span className="pu-bone" style={{ width: 130, height: 16 }} />
          <span className="pu-bone" style={{ width: 110, height: 16 }} />
          <span className="pu-bone" style={{ width: 90, height: 16 }} />
        </div>
      </div>

      <div className="pu-skel-course-layout">
        {/* Cột trái: Danh sách Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map((mod) => (
            <div key={mod} className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="pu-bone" style={{ width: '50%', height: 18 }} />
                <span className="pu-bone" style={{ width: 60, height: 12 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {[1, 2].map((lesson) => (
                  <div key={lesson} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                    <span className="pu-bone" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                    <span className="pu-bone" style={{ width: '60%', height: 13 }} />
                    <span className="pu-bone" style={{ width: 45, height: 11, marginLeft: 'auto' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cột phải: Sticky Action Card */}
        <div className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content' }}>
          <div className="pu-bone" style={{ width: '100%', height: 160, borderRadius: 14 }} />
          <span className="pu-bone" style={{ width: '80%', height: 20 }} />
          <span className="pu-bone" style={{ width: '100%', height: 44, borderRadius: 14 }} />
          <span className="pu-bone" style={{ width: '60%', height: 12, margin: '0 auto' }} />
        </div>
      </div>
    </div>
  );
}

/**
 * 4. SKELETON TRÌNH PHÁT BÀI HỌC (EM-06 - /enterprise/me/courses/:id/modules/:id)
 * Split-view giữa khung Media Player (16:9) và danh mục bài học (Syllabus Drawer).
 */
export function PulseModulePlayerSkeleton() {
  return (
    <div className="pu-skel-player-layout" role="status" aria-label="Đang tải Bài học">
      {/* Player / Reader Frame */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="pu-bone pu-skel-media-frame" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '70%' }}>
            <span className="pu-bone" style={{ width: '85%', height: 24, borderRadius: 6 }} />
            <span className="pu-bone" style={{ width: '45%', height: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="pu-bone" style={{ width: 100, height: 38, borderRadius: 12 }} />
            <span className="pu-bone" style={{ width: 100, height: 38, borderRadius: 12 }} />
          </div>
        </div>
      </div>

      {/* Syllabus Sidebar */}
      <div className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="pu-bone" style={{ width: 140, height: 18 }} />
        <span className="pu-bone" style={{ width: '100%', height: 6, borderRadius: 999 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 10 }}>
              <span className="pu-bone" style={{ width: 16, height: 16, borderRadius: '50%' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="pu-bone" style={{ width: '75%', height: 12 }} />
                <span className="pu-bone" style={{ width: '35%', height: 9 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 5. SKELETON THỰC HÀNH & NHIỆM VỤ (EM-03 - /enterprise/me/practice)
 * Lưới thẻ bài tập thực tế tại nơi làm việc kèm chỉ số Rubric.
 */
export function PulsePracticeSkeleton() {
  return (
    <div className="pu-skel-today" role="status" aria-label="Đang tải Khảo thí & Thực hành">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div>
          <span className="pu-bone" style={{ width: 130, height: 12, marginBottom: 8 }} />
          <span className="pu-bone" style={{ width: 280, height: 28, borderRadius: 8 }} />
        </div>
        <div className="pu-skel-tabs">
          {[90, 110, 90].map((w, idx) => (
            <span key={idx} className="pu-bone" style={{ width: w, height: 36, borderRadius: 999 }} />
          ))}
        </div>
      </div>

      <div className="pu-skel-tasks-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="pu-bone" style={{ width: 85, height: 22, borderRadius: 999 }} />
              <span className="pu-bone" style={{ width: 65, height: 12 }} />
            </div>
            <span className="pu-bone" style={{ width: '85%', height: 20, borderRadius: 6 }} />
            <span className="pu-bone" style={{ width: '100%', height: 36 }} />
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="pu-bone" style={{ width: 80, height: 12 }} />
              <span className="pu-bone" style={{ width: 90, height: 32, borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 6. SKELETON CHỨNG NHẬN SỐ & THÀNH TÍCH (EM-08 - /enterprise/me/outcomes)
 * Thẻ chứng chỉ số có hoa văn chìm, QR code và chữ ký số chuẩn hóa.
 */
export function PulseOutcomesSkeleton() {
  return (
    <div className="pu-skel-today" role="status" aria-label="Đang tải Chứng nhận số">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        <span className="pu-bone" style={{ width: 140, height: 12 }} />
        <span className="pu-bone" style={{ width: 260, height: 28, borderRadius: 8 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {[1, 2].map((i) => (
          <div key={i} className="pu-skel-card" style={{ display: 'flex', flexDirection: 'column', gap: 18, border: '1.5px solid #e0e7ff', background: 'linear-gradient(145deg, #ffffff 0%, #fbfcfe 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '65%' }}>
                <span className="pu-bone" style={{ width: 90, height: 12 }} />
                <span className="pu-bone" style={{ width: '100%', height: 22, borderRadius: 6 }} />
                <span className="pu-bone" style={{ width: '60%', height: 12 }} />
              </div>
              <div className="pu-bone" style={{ width: 68, height: 68, borderRadius: 10 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <span className="pu-bone" style={{ width: 120, height: 14 }} />
              <span className="pu-bone" style={{ width: 95, height: 32, borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 7. SKELETON PHÒNG THI GIÁM SÁT (EM-T2 - /enterprise/me/trial-test/exam)
 * Khung kiểm tra 3 thiết bị Camera, Mic, Screen Share trước khi vào thi.
 */
export function PulseExamReadySkeleton() {
  return (
    <div className="pu-skel-today" style={{ maxWidth: 840, alignItems: 'center' }} role="status" aria-label="Đang chuẩn bị phòng thi">
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <span className="pu-bone" style={{ width: 120, height: 12 }} />
        <span className="pu-bone" style={{ width: 340, height: 28, borderRadius: 8 }} />
        <span className="pu-bone" style={{ width: 440, height: 14 }} />
      </div>

      <div className="pu-skel-hardware-checks" style={{ width: '100%' }}>
        {['Webcam', 'Microphone', 'Màn hình'].map((device) => (
          <div key={device} className="pu-skel-card pu-skel-hardware-card">
            <span className="pu-bone" style={{ width: 48, height: 48, borderRadius: '50%' }} />
            <span className="pu-bone" style={{ width: 90, height: 16 }} />
            <span className="pu-bone" style={{ width: 120, height: 12 }} />
          </div>
        ))}
      </div>

      <span className="pu-bone" style={{ width: 220, height: 46, borderRadius: 14 }} />
    </div>
  );
}
