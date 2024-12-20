export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 获取客户端 IP
        const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                        req.headers['x-real-ip'] ||
                        req.socket.remoteAddress;

        if (!clientIP) {
            return res.status(400).json({ error: 'Could not determine client IP' });
        }

        // 使用 IP-API 免费版本
        const response = await fetch(`http://ip-api.com/json/${clientIP}`, {
            headers: {
                'User-Agent': 'TrumpDownStep/1.0'
            },
            timeout: 5000 // 5 秒超时
        });

        if (!response.ok) {
            throw new Error(`IP API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
            return res.status(200).json({
                ip: clientIP,
                timezone: data.timezone,
                offset: data.offset,
                country: data.country,
                region: data.region
            });
        } else {
            return res.status(400).json({ 
                error: 'Location lookup failed',
                message: data.message || 'Unknown error'
            });
        }
    } catch (error) {
        console.error('IP API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
