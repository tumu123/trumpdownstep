export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                        req.socket.remoteAddress;

        // 调用 IP-API.com
        const response = await fetch(`http://ip-api.com/json/${clientIP}`);
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
            return res.status(400).json({ error: 'Could not determine location' });
        }
    } catch (error) {
        console.error('IP API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
