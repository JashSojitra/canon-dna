export function FeedArt({ id, label }: { id: string; label: string }) {
  return <svg viewBox="0 0 800 450" role="img" aria-label={`${label}, illustrated simulated source`} className={`feed-art art-${id}`}>
    <rect width="800" height="450" fill="#d5d3cd" />
    {id === "slides" ? <>
      <rect width="800" height="450" fill="#ecebe5" /><rect x="55" y="52" width="28" height="5" fill="#b3212c" />
      <text x="55" y="99" fill="#686863" fontSize="14" letterSpacing="3">ENGINEERING / FOUNDATIONS</text>
      <text x="55" y="174" fill="#252525" fontSize="44" fontWeight="600">A different perspective.</text>
      <text x="55" y="210" fill="#686863" fontSize="19">Observe. Understand. Build.</text>
      <g stroke="#8b8a83" fill="none" strokeWidth="2"><path d="M470 360L610 245L730 360Z M610 245V390 M470 360L610 390L730 360" /><ellipse cx="610" cy="350" rx="65" ry="20" /></g>
      <text x="55" y="393" fill="#686863" fontSize="13">01 — SYSTEMS &amp; PERSPECTIVE</text>
    </> : id === "whiteboard" ? <>
      <rect x="30" y="28" width="740" height="367" rx="3" fill="#9a9c93" /><rect x="38" y="36" width="724" height="350" fill="#eeeee5" />
      <g fill="#444b46" fontFamily="Georgia, serif" fontStyle="italic"><text x="84" y="100" fontSize="28">Systems in equilibrium</text><text x="95" y="177" fontSize="30">Σ F = 0</text><text x="95" y="237" fontSize="25">F₁ + F₂ + F₃ = 0</text><text x="95" y="310" fontSize="20">Observe each force independently.</text></g>
      <g stroke="#606d63" strokeWidth="3" fill="none"><path d="M560 260V120M560 260L680 260M560 260L485 325M560 120L550 140M560 120L570 140" /><circle cx="560" cy="260" r="12" /><path d="M460 350H710" /></g><rect x="65" y="390" width="660" height="10" fill="#74766e" />
    </> : id === "workbench" ? <>
      <rect width="800" height="450" fill="#bfc1bc" /><path d="M0 70H800M0 140H800" stroke="#999e96" /><path d="M70 165L690 165L800 450H0Z" fill="#b1a28b" /><path d="M95 185L672 185L760 425H30Z" fill="#d3c2a4" />
      <g stroke="#434848" strokeWidth="8" fill="#7b8581"><path d="M230 330V225H430V330" /><rect x="205" y="325" width="255" height="22" rx="4" /><circle cx="330" cy="263" r="47" fill="#b5bab3" /><path d="M330 216V310M284 263H377" strokeWidth="3" /></g>
      <rect x="520" y="250" width="115" height="85" rx="6" fill="#3d4541" /><rect x="531" y="261" width="93" height="41" fill="#a8bab0" /><path d="M555 340C540 400 420 380 400 320" fill="none" stroke="#a52a30" strokeWidth="4" />
    </> : <>
      <rect width="800" height="450" fill="#b8b9b0" /><rect x="50" y="35" width="480" height="275" fill="#e4e4d9" /><rect x="60" y="45" width="460" height="255" fill="#dadfd6" />
      <g stroke="#8b978c" strokeWidth="2" fill="none"><path d="M95 120H285M95 145H240M95 170H265M345 230V100M305 230L395 130L465 230Z" /></g><rect x="585" y="0" width="14" height="340" fill="#989b92" /><rect x="610" y="30" width="160" height="265" fill="#d6d8cf" /><path d="M690 30V295M610 165H770" stroke="#a7aba0" strokeWidth="7" />
      <g><path d="M365 450L375 276Q405 244 453 270L482 450" fill="#414c4b" /><ellipse cx="416" cy="217" rx="34" ry="42" fill="#c59d7e" /><path d="M382 208Q378 163 423 169Q458 175 451 212L434 188L390 194Z" fill="#45433e" /><path d="M380 293L315 337L258 286" fill="none" stroke="#414c4b" strokeWidth="25" strokeLinecap="round" /><path d="M260 286L246 268" stroke="#c59d7e" strokeWidth="16" strokeLinecap="round" /></g>
      <path d="M110 402H680L725 450H70Z" fill="#85867b" /><rect x="510" y="349" width="105" height="62" rx="4" fill="#4c514e" />
    </>}
  </svg>;
}
