(() => {
    const whatsapp = document.querySelector('.floating-whatsapp');
    if (!whatsapp) return;
    const topics = [
        { question: 'Quero saber preços e disponibilidade', answer: 'Escolha um modelo no catálogo e toque em “Consultar o valor”. Nossa equipe confirma o preço e a disponibilidade pelo WhatsApp.', href: '#catalogo', label: 'Ver catálogo' },
        { question: 'Posso dar meu celular na troca?', answer: 'Sim! Aceitamos seu usado como parte do pagamento. Preencha a avaliação em Troca Inteligente e envie os dados pelo WhatsApp para a equipe avaliar seu aparelho.', href: '#troca', label: 'Avaliar meu aparelho' },
        { question: 'Qual é o horário de atendimento?', answer: 'Segunda a sexta: das 9h às 18h. Sábado: das 8h às 13h. Domingo: fechado.' },
        ...Array.from(document.querySelectorAll('#faq .faq-item'), item => ({
            question: item.querySelector('summary').textContent.trim(),
            answer: item.querySelector('.faq-answer').textContent.trim()
        }))
    ];
    const widget = document.createElement('div');
    widget.className = 'store-assistant';
    widget.innerHTML = `
        <div id="assistant-panel" class="assistant-panel" role="region" aria-labelledby="assistant-title" hidden>
            <div class="assistant-heading">
                <div><h2 id="assistant-title">Assistente Total</h2><p>Respostas rápidas para você</p></div>
                <button type="button" class="assistant-close" aria-label="Fechar assistente">×</button>
            </div>
            <div class="assistant-body">
                <p>Olá! Sou o assistente virtual da Total. Digite sua dúvida ou escolha uma pergunta. Respondo sobre os assuntos disponíveis aqui; para outras dúvidas, nossa equipe ajuda pelo WhatsApp.</p>
                <div class="assistant-topics" role="group" aria-label="Perguntas frequentes"></div>
                <div class="assistant-answer" role="status" aria-live="polite" aria-atomic="true"></div>
                <a class="assistant-shortcut" hidden></a>
            </div>
            <form class="assistant-form">
                <label for="assistant-message">Digite sua dúvida</label>
                <div class="assistant-input-row">
                    <input id="assistant-message" type="text" maxlength="500" placeholder="Ex.: vocês fazem entrega?" required autocomplete="off" enterkeyhint="send">
                    <button type="submit">Enviar</button>
                </div>
            </form>
            <a class="assistant-whatsapp" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> Falar com a equipe no WhatsApp</a>
        </div>
        <button type="button" class="assistant-launcher" aria-expanded="false" aria-controls="assistant-panel">
            <i class="fas fa-robot" aria-hidden="true"></i> <span>Precisa de ajuda?</span>
        </button>`;
    const panel = widget.querySelector('#assistant-panel');
    const launcher = widget.querySelector('.assistant-launcher');
    const close = widget.querySelector('.assistant-close');
    const answer = widget.querySelector('.assistant-answer');
    const shortcut = widget.querySelector('.assistant-shortcut');
    const contact = widget.querySelector('.assistant-whatsapp');
    contact.href = whatsapp.href;
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const rules = [
        { pattern: /\b(bateria|saude|porcentagem)\b/, topic: 'bateria' },
        { pattern: /\b(entrega|entregam|entregar|envio|enviam|frete|motoboy)\b/, topic: 'motoboy' },
        { pattern: /\b(garantia|brinde|brindes|acompanha|acessorios|carregador)\b/, topic: 'acompanha' },
        { pattern: /\b(endereco|localizacao|onde|retirada|retirar|retira|loja fisica)\b/, topic: 'retirar' },
        { pattern: /\b(horario|horarios|abre|abrem|fecha|fecham|aberto|sabado|domingo|funcionamento)\b/, topic: 'horario' },
        { pattern: /\b(troca|trocar|usado|usados|avaliacao|avaliar)\b/, topic: 'troca' },
        { pattern: /\b(preco|precos|valor|valores|custa|quanto|estoque|disponibilidade|comprar|iphone|ipad|xiaomi|samsung|celular)\b/, topic: 'precos' }
    ];
    function respond(topic, message, selectedButton) {
        widget.querySelectorAll('.assistant-topics button').forEach(button => {
            button.setAttribute('aria-pressed', String(button === selectedButton));
        });
        answer.textContent = topic.answer;
        shortcut.hidden = !topic.href;
        if (topic.href) {
            shortcut.href = topic.href;
            shortcut.textContent = topic.label;
        }
        const url = new URL(whatsapp.href);
        url.searchParams.set('text', `Olá, Total Celulares! Vim pelo assistente do site e gostaria de ajuda: ${message}`);
        contact.href = url.href;
        answer.scrollIntoView({ block: 'nearest' });
    }
    widget.querySelector('#assistant-message').addEventListener('input', event => {
        if (event.target.value.trim()) return;
        answer.textContent = '';
        shortcut.hidden = true;
        shortcut.removeAttribute('href');
        shortcut.textContent = '';
        contact.href = whatsapp.href;
        widget.querySelectorAll('.assistant-topics button').forEach(button => {
            button.setAttribute('aria-pressed', 'false');
        });
    });
    widget.querySelector('.assistant-form').addEventListener('submit', event => {
        event.preventDefault();
        const input = widget.querySelector('#assistant-message');
        const message = input.value.trim();
        if (!message) { input.focus(); return; }
        const normalized = normalize(message);
        const rule = rules.find(item => item.pattern.test(normalized));
        const topic = topics.find(item => normalize(item.question) === normalized)
            || (rule && topics.find(item => normalize(item.question).includes(rule.topic)));
        const greeting = /^(oi|ola|bom dia|boa tarde|boa noite|obrigad[oa])[!.\s]*$/.test(normalized);
        respond(topic || {
            answer: greeting
                ? 'Olá! Como posso ajudar? Você pode perguntar sobre preços, troca, horário, bateria, garantia, retirada ou entrega.'
                : 'Não encontrei uma resposta pronta para essa dúvida. Toque em “Falar com a equipe no WhatsApp” para levar sua mensagem ao atendimento.'
        }, message);
    });
    function setOpen(open) {
        panel.hidden = !open;
        launcher.setAttribute('aria-expanded', String(open));
        if (open) close.focus();
        else launcher.focus();
    }
    topics.forEach(topic => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = topic.question;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
            respond(topic, topic.question, button);
        });
        widget.querySelector('.assistant-topics').append(button);
    });
    launcher.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    shortcut.addEventListener('click', () => {
        setOpen(false);
        const target = document.querySelector(shortcut.getAttribute('href'));
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        }
    });
    widget.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden) {
            event.preventDefault();
            setOpen(false);
        }
    });
    document.body.append(widget);
    whatsapp.style.display = 'none';
})();
