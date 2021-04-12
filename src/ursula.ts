function findVideos(): void {
    const videos = document.querySelectorAll('.lecturecVideo');

    videos.forEach(el => {
        const currentBtn = el.querySelector<HTMLButtonElement>('.btn');
        const video = el.querySelector<HTMLVideoElement>('.lecturec');

        if (currentBtn && video) {
            const downloadBtn = document.createElement('button');

            downloadBtn.classList.add(...currentBtn.classList);
            downloadBtn.style.marginLeft = '10px';
            downloadBtn.innerText = 'Download video';
            downloadBtn.value = video.src || video.currentSrc;
            downloadBtn.onclick = createDownload;

            currentBtn.parentElement?.append(downloadBtn);
        }
    });

    console.debug(`[ursula] found ${videos.length} videos`);
}

function createDownload(event: MouseEvent): void {
    event.preventDefault();
    const btn = event.target as HTMLButtonElement;
    const msg = {
        action: MsgAction.ADD_DOWNLOAD,
        url: btn.value
    };

    // TODO: implement button disabling and enabling
    browser.runtime.sendMessage(msg).then(resp => {
        if (resp?.ok) {
            btn.classList.replace('btn-primary', 'btn-success');
            btn.innerText = 'Download added!';
        }
        else {
            btn.classList.replace('btn-primary', 'btn-danger');
            btn.innerText = 'Error, try again!';
        }
    }).catch(err => console.error(err));
}

console.log('Ursula loaded!');
findVideos();


// TODO: remove me before release!
document.body.style.border = '5px solid red';
