async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: 'test-subject',
        date: new Date().toISOString().split('T')[0],
        attendanceData: { 'cmn4a88620840u0w4vt4u4oig': 'present' },
        topicCovered: 'Test Topic'
      })
    });
    const data = await res.json();
    console.log('Success:', data.success, data.message);
  } catch (e) {
    console.error(e);
  }
}
main();
