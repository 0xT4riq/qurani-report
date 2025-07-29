// تحديث: إضافة خاصية تعديل التقرير وتصدير PDF

const dummyAccounts = [
    { name: 'أحمد بن سعيد', password: '123', approved: true },
    { name: 'المشرف', password: 'admin', approved: true },
    { name: 'سالم الهنائي', password: '456', approved: false }
  ];
  
  let dummyReports = [
    { name: 'أحمد بن سعيد', date: '2025-07-29', surah: 'الزمر', week: 'الأسبوع 1', hadir: true, istighfar: true, salawat: true, murajaah: false, tathbit: true, hifz: false },
  ];
  
  let currentUser = null;
  
  function login() {
    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value.trim();
    const user = dummyAccounts.find(u => u.name === name && u.password === password);
  
    if (!user) return alert('معلومات الدخول غير صحيحة');
  
    currentUser = user;
    document.getElementById('login-box').classList.add('hidden');
  
    if (user.name === 'المشرف') {
      document.getElementById('admin-box').classList.remove('hidden');
      showReports();
      showAccountRequests();
    } else if (!user.approved) {
      alert('الحساب في انتظار موافقة المشرف');
    } else {
      document.getElementById('report-box').classList.remove('hidden');
    }
  }
  
  function submitReport() {
    const newReport = {
      name: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      surah: document.getElementById('surahSelect').value,
      week: document.getElementById('weekSelect').value,
      hadir: document.getElementById('hadir').checked,
      istighfar: document.getElementById('istighfar').checked,
      salawat: document.getElementById('salawat').checked,
      murajaah: document.getElementById('murajaah').checked,
      tathbit: document.getElementById('tathbit').checked,
      hifz: document.getElementById('hifz').checked
    };
    dummyReports.push(newReport);
    alert('✅ تم إرسال التقرير بنجاح');
    document.getElementById('report-box').classList.add('hidden');
  }
  
  function showReports() {
    const container = document.getElementById('reports-list');
    const filter = document.getElementById('searchInput')?.value?.trim();
    container.innerHTML = '';
    dummyReports
      .filter(rep => !filter || rep.name.includes(filter))
      .forEach((rep, idx) => {
        const div = document.createElement('div');
        div.classList.add('report-section');
        div.innerHTML = `
          <p><strong>${rep.name}</strong> - ${rep.week} - سورة ${rep.surah} (${rep.date})</p>
          <ul>
            <li>حضور اللقاء: ${rep.hadir ? '✅' : '❌'}</li>
            <li>استغفار: ${rep.istighfar ? '✅' : '❌'}</li>
            <li>صلاة على النبي: ${rep.salawat ? '✅' : '❌'}</li>
            <li>مراجعة: ${rep.murajaah ? '✅' : '❌'}</li>
            <li>تثبيت: ${rep.tathbit ? '✅' : '❌'}</li>
            <li>حفظ: ${rep.hifz ? '✅' : '❌'}</li>
          </ul>
          <button onclick="editReport(${idx})">✏️ تعديل</button>
          <button onclick="exportPDF(${idx})">📄 تحميل PDF</button>
        `;
        container.appendChild(div);
      });
  }
  
  function editReport(index) {
    const rep = dummyReports[index];
    const form = document.createElement('form');
    form.innerHTML = `
      <h4>تعديل التقرير لـ ${rep.name} (${rep.date})</h4>
      <label>الأسبوع:</label>
      <input type="text" id="edit-week" value="${rep.week}">
      <label>السورة:</label>
      <input type="text" id="edit-surah" value="${rep.surah}">
      <label><input type="checkbox" id="edit-hadir" ${rep.hadir ? 'checked' : ''}> حضور اللقاء</label><br>
      <label><input type="checkbox" id="edit-istighfar" ${rep.istighfar ? 'checked' : ''}> استغفار</label><br>
      <label><input type="checkbox" id="edit-salawat" ${rep.salawat ? 'checked' : ''}> صلاة على النبي</label><br>
      <label><input type="checkbox" id="edit-murajaah" ${rep.murajaah ? 'checked' : ''}> مراجعة</label><br>
      <label><input type="checkbox" id="edit-tathbit" ${rep.tathbit ? 'checked' : ''}> تثبيت</label><br>
      <label><input type="checkbox" id="edit-hifz" ${rep.hifz ? 'checked' : ''}> حفظ</label><br>
      <button type="submit">💾 حفظ</button>
    `;
    form.onsubmit = function (e) {
      e.preventDefault();
      rep.week = document.getElementById('edit-week').value;
      rep.surah = document.getElementById('edit-surah').value;
      rep.hadir = document.getElementById('edit-hadir').checked;
      rep.istighfar = document.getElementById('edit-istighfar').checked;
      rep.salawat = document.getElementById('edit-salawat').checked;
      rep.murajaah = document.getElementById('edit-murajaah').checked;
      rep.tathbit = document.getElementById('edit-tathbit').checked;
      rep.hifz = document.getElementById('edit-hifz').checked;
      alert('✅ تم تعديل التقرير');
      showReports();
    };
    const container = document.getElementById('reports-list');
    container.innerHTML = '';
    container.appendChild(form);
  }
  
  function exportPDF(index) {
    const rep = dummyReports[index];
    const content = `
      تقرير الطالب: ${rep.name}\n
      التاريخ: ${rep.date}\n
      الأسبوع: ${rep.week} | السورة: ${rep.surah}\n\n
      حضور اللقاء: ${rep.hadir ? '✅' : '❌'}\n
      استغفار: ${rep.istighfar ? '✅' : '❌'}\n
      صلاة على النبي: ${rep.salawat ? '✅' : '❌'}\n
      مراجعة: ${rep.murajaah ? '✅' : '❌'}\n
      تثبيت: ${rep.tathbit ? '✅' : '❌'}\n
      حفظ: ${rep.hifz ? '✅' : '❌'}\n
    `;
    const doc = new jsPDF();
    doc.setFont('Arial');
    doc.setFontSize(12);
    doc.text(content, 10, 10);
    doc.save(`${rep.name}-${rep.date}.pdf`);
  }
  
  function showAccountRequests() {
    const container = document.getElementById('accounts-requests');
    container.innerHTML = '';
    const requests = dummyAccounts.filter(u => u.name !== 'المشرف' && !u.approved);
    if (requests.length === 0) {
      container.innerHTML = '<p>لا توجد طلبات جديدة.</p>';
      return;
    }
    requests.forEach((req, index) => {
      const div = document.createElement('div');
      div.innerHTML = `<p>${req.name} <button onclick="approve(${index})">موافقة</button></p>`;
      container.appendChild(div);
    });
  }
  
  function approve(index) {
    const pending = dummyAccounts.filter(u => u.name !== 'المشرف' && !u.approved);
    pending[index].approved = true;
    alert('تمت الموافقة على الحساب');
    showAccountRequests();
  }
  
  function logout() {
    currentUser = null;
    document.getElementById('login-box').classList.remove('hidden');
    document.getElementById('report-box').classList.add('hidden');
    document.getElementById('admin-box').classList.add('hidden');
  }
  