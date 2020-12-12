fetch('discordGateway')
  .then(res => res.json())
  .then(data => {
    const ok = data.code === 200
    const color = ok ? 'green' : 'red'
    document.querySelector('#gatewayStatus').innerHTML = `
      <span>
        Gateway status:
        <span style="color: ${color}">${data.code}</span>
        (${data.message}) 
        <span style="color: red"><i>${!ok ? data.retryAfter : ''}</i></span>
        checked ${data.lastCheck}
      </span>
    `
  })