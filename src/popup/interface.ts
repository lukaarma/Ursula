
async function queryDownloads(): Promise<void> {
    const res: MsgResponse = await browser.runtime.sendMessage({
        action: MsgAction.GET_DOWNLOADS
    });

    if (res.ok && res.queue?.length) {
        const tableBody = document.querySelector<HTMLTableSectionElement>('.filesTable');

        if (tableBody) {
            // update current values
            for (let i = 0; i < tableBody.rows.length; i++) {
                const row = tableBody.rows.item(i);
                row!.cells.item(1)!.innerText = `${+res.queue[i].progess.toFixed(2)} %`;
                row!.cells.item(2)!.innerText = res.queue[i].status;
            }
            // eventually add new downloads
            for (let i = tableBody.rows.length; i < res.queue.length; i++) {
                const newRow = tableBody.insertRow();
                newRow.insertCell().innerText = res.queue[i].filename;
                newRow.insertCell().innerText = `${+res.queue[i].progess.toFixed(2)} %`;
                newRow.insertCell().innerText = res.queue[i].status;
            }
        }
        else {
            console.error('No table in popup!');
        }
    }
    else {
        console.error('Query to backend failed!');
    }


}

setInterval(queryDownloads, 1500);
