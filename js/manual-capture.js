const button = document.getElementById('capture');
const metadataButton = document.getElementById('metadata');
const status = document.getElementById('capture-status');
const preview = document.getElementById('preview');
const previewWrap = document.getElementById('preview-wrap');
let previewURL = null;
let diagnostic = null;

const filenameTime = date => date.toISOString().replace(/[:.]/g, '-');
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function message(text) { status.textContent = text; }

button.addEventListener('click', async () => {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    message('Seu navegador não oferece captura de aba. Use Chrome ou Edge atualizado, em HTTPS ou localhost.');
    return;
  }
  button.disabled = true;
  let stream;
  let video;
  try {
    // O navegador solicita permissão SOMENTE após o clique e o usuário escolhe a aba.
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    const track = stream.getVideoTracks()[0];
    if (!track) throw new Error('Nenhuma faixa de vídeo foi recebida.');
    video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await new Promise((resolve, reject) => {
      video.addEventListener('loadedmetadata', resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
    });
    await video.play();
    await new Promise(resolve => {
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(() => resolve());
      else window.setTimeout(resolve, 350);
    });
    if (!video.videoWidth || !video.videoHeight) throw new Error('O navegador não forneceu uma imagem válida.');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!imageBlob) throw new Error('Não foi possível gerar o PNG.');
    const now = new Date();
    const filename = 'salessite-captura-' + filenameTime(now) + '.png';
    downloadBlob(imageBlob, filename);
    if (previewURL) URL.revokeObjectURL(previewURL);
    previewURL = URL.createObjectURL(imageBlob);
    preview.src = previewURL;
    previewWrap.hidden = false;
    diagnostic = {
      generatedAt: now.toISOString(),
      screenshotFilename: filename,
      screenshotWidth: canvas.width,
      screenshotHeight: canvas.height,
      capturedSurface: track.getSettings?.().displaySurface || 'não informada',
      tool: 'SalesSite diagnóstico visual',
      note: 'Esta captura foi feita localmente após autorização explícita e não foi enviada automaticamente.'
    };
    metadataButton.disabled = false;
    message('Captura salva: ' + filename + '. Confira a prévia e anexe o arquivo PNG ao ChatGPT.');
  } catch (error) {
    const cancelled = error && (error.name === 'NotAllowedError' || error.name === 'AbortError');
    message(cancelled ? 'Captura cancelada. Você pode tentar novamente.' :
      'Falha ao capturar: ' + (error.message || 'erro desconhecido'));
  } finally {
    // Libera imediatamente a permissão de compartilhamento após fotografar.
    stream?.getTracks().forEach(track => track.stop());
    if (video) video.srcObject = null;
    button.disabled = false;
  }
});

metadataButton.addEventListener('click', () => {
  if (!diagnostic) return;
  downloadBlob(new Blob([JSON.stringify(diagnostic, null, 2)], { type: 'application/json' }),
    'salessite-diagnostico-' + filenameTime(new Date()) + '.json');
});

window.addEventListener('pagehide', () => { if (previewURL) URL.revokeObjectURL(previewURL); });
