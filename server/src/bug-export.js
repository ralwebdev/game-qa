import ExcelJS from 'exceljs';

export async function createBugWorkbook(bugs) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Bug Reports');
  sheet.columns = [
    ['Report ID', 'id'], ['Learner', 'learner'], ['Email', 'email'],
    ['Title', 'title'], ['Category', 'category'], ['Description', 'description'],
    ['Game / App', 'appName'], ['Build', 'build'], ['Severity', 'severity'],
    ['Priority', 'priority'], ['Frequency', 'frequency'], ['Preconditions', 'preconditions'],
    ['Steps', 'steps'], ['Expected', 'expected'], ['Actual', 'actual'],
    ['Impact', 'impact'], ['Comments', 'notes'], ['Attachment', 'media'],
    ['Device', 'device'], ['OS', 'os'], ['Tested devices', 'devices'],
    ['Status', 'status'], ['Review note', 'reviewNote'], ['Created at', 'createdAt'], ['Updated at', 'updatedAt']
  ].map(([header, key]) => ({ header, key, width: 25 }));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: 'Y1' };
  for (const bug of bugs) {
    sheet.addRow({
      ...bug, id: String(bug._id), learner: bug.user?.name || '', email: bug.user?.email || '',
      devices: (bug.devices || []).map(d => [
        `Platform: ${d.platform || ''}`, `Device: ${d.device || ''}`, `OS: ${d.os || ''}`,
        `CPU: ${d.cpu || ''}`, `GPU: ${d.gpu || ''}`, `Graphics: ${d.graphics || ''}`, `Result: ${d.result || ''}`
      ].join(' | ')).join('\n'),
      createdAt: bug.createdAt?.toISOString() || '', updatedAt: bug.updatedAt?.toISOString() || ''
    });
  }
  return workbook.xlsx.writeBuffer();
}
