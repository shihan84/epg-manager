# EPG Hosting for Distributors

## 🌐 **Online XMLTV EPG Hosting**

Your EPG Manager Enterprise solution provides comprehensive online EPG hosting capabilities that allow your clients to provide XMLTV EPG data to their distributors through permanent, accessible URLs.

## ✨ **Key Features**

### 🔗 **Permanent EPG URLs**

- Each client gets a unique, permanent EPG URL
- URLs automatically update when schedules change
- No need to manually distribute new files
- Compatible with all major IPTV players and systems

### 📡 **Real-time Updates**

- EPG data updates automatically when schedules change
- WebSocket notifications for real-time updates
- Caching for optimal performance
- CDN integration ready

### 🎯 **Multi-format Support**

- **XMLTV** - Standard format for IPTV players
- **JSON** - For custom applications and APIs
- **Custom formats** - Extensible for specific needs

## 🚀 **How It Works**

### 1. **EPG Generation**

```bash
POST /api/epg/generate
{
  "channels": ["channel1", "channel2"], // Optional: specific channels
  "startDate": "2024-01-01T00:00:00Z", // Optional: start date
  "endDate": "2024-01-07T23:59:59Z",   // Optional: end date
  "format": "xmltv",                   // xmltv or json
  "includeImages": true                // Include program images
}
```

### 2. **Hosted EPG URL**

Each client gets a permanent URL:

```
https://yourdomain.com/api/epg/hosted/{userId}
```

### 3. **Automatic Updates**

- EPG regenerates when schedules change
- URL remains the same, content updates
- Distributors always get the latest data

## 📋 **For Your Clients**

### **Getting Started**

1. **Login** to the EPG Manager dashboard
2. **Go to EPG** section
3. **Generate EPG** with desired settings
4. **Copy the hosted URL** for distributors

### **EPG Management Interface**

- **Generate New EPG** - Create fresh EPG data
- **Hosted URL** - Permanent URL for distributors
- **Download EPG** - Download XML/JSON files
- **Settings** - Configure auto-updates and preferences

### **Distributor Instructions**

Your clients can provide these instructions to their distributors:

#### **For IPTV Players:**

```
Add this URL to your IPTV player's EPG settings:
https://yourdomain.com/api/epg/hosted/{userId}

Most players support XMLTV format automatically.
```

#### **For Kodi:**

```
1. Go to Settings → TV → General
2. Electronic Program Guide → XMLTV URL
3. Enter: https://yourdomain.com/api/epg/hosted/{userId}
4. Save and restart Kodi
```

#### **For Plex:**

```
1. Go to Settings → Live TV & DVR
2. Add XMLTV URL: https://yourdomain.com/api/epg/hosted/{userId}
3. Plex will import the program guide data
```

#### **For Custom Applications:**

```
Use this URL to fetch the latest EPG data:
https://yourdomain.com/api/epg/hosted/{userId}

The URL returns XMLTV format and updates automatically.
```

## 🔧 **Technical Implementation**

### **API Endpoints**

#### **Generate EPG**

```http
POST /api/epg/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "channels": ["channel_id_1", "channel_id_2"],
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-07T23:59:59Z",
  "format": "xmltv",
  "includeImages": true
}
```

**Response:**

```json
{
  "success": true,
  "epgUrl": "https://yourdomain.com/api/epg/hosted/user123",
  "format": "xmltv",
  "generatedAt": "2024-01-01T12:00:00Z",
  "downloadUrl": "https://yourdomain.com/api/epg/download/user123",
  "expiresAt": "2024-01-08T12:00:00Z"
}
```

#### **Get Hosted EPG**

```http
GET /api/epg/hosted/{userId}
Accept: application/xml
```

**Response:** XMLTV content with proper headers

#### **Download EPG**

```http
GET /api/epg/download/{userId}
Authorization: Bearer {token}
```

**Response:** File download with XMLTV content

### **XMLTV Format Example**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE tv SYSTEM "xmltv.dtd">
<tv generator-info-name="EPG Manager Enterprise" generator-info-url="https://epgmanager.com">
  <channel id="channel1">
    <display-name>News Channel</display-name>
    <desc>24/7 News Channel</desc>
    <icon src="https://example.com/logo.png" />
  </channel>

  <programme start="20240101120000 +0000" stop="20240101130000 +0000" channel="channel1">
    <title>Morning News</title>
    <desc>Daily morning news update</desc>
    <category>News</category>
    <new />
    <icon src="https://example.com/news-image.jpg" />
  </programme>
</tv>
```

## 🏗️ **Enterprise Features**

### **Multi-tenant Support**

- Each client gets isolated EPG data
- Secure access controls
- Custom branding options

### **Performance Optimization**

- Redis caching for fast access
- CDN integration for global delivery
- Compression for reduced bandwidth

### **Monitoring & Analytics**

- EPG generation metrics
- Access statistics
- Error tracking and alerting

### **Security**

- Rate limiting on EPG endpoints
- Access logging and audit trails
- DDoS protection

## 📊 **Usage Examples**

### **Client Dashboard Integration**

```javascript
// Generate EPG
const response = await fetch('/api/epg/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channels: selectedChannels,
    format: 'xmltv',
    includeImages: true,
  }),
});

const { epgUrl } = await response.json();
console.log('EPG URL:', epgUrl);
```

### **Distributor Integration**

```javascript
// Fetch EPG data
const response = await fetch('https://yourdomain.com/api/epg/hosted/user123');
const epgData = await response.text();

// Parse XMLTV
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(epgData, 'text/xml');
```

## 🔄 **Auto-update Workflow**

1. **Schedule Change** - User updates program schedule
2. **Webhook Trigger** - System detects change
3. **EPG Regeneration** - New EPG generated automatically
4. **URL Update** - Same URL now serves new content
5. **Distributor Notification** - Optional webhook to notify distributors

## 📈 **Scalability**

### **High Availability**

- Load balancing across multiple servers
- Database replication for reliability
- CDN distribution for global access

### **Performance Tuning**

- Redis caching layer
- Database query optimization
- Compression and minification

### **Monitoring**

- Real-time metrics and alerts
- Performance dashboards
- Error tracking and reporting

## 🛡️ **Security Considerations**

### **Access Control**

- User authentication required for generation
- Public access for hosted URLs
- Rate limiting to prevent abuse

### **Data Protection**

- Secure data transmission (HTTPS)
- Input validation and sanitization
- Audit logging for compliance

## 📞 **Support & Maintenance**

### **Client Support**

- Comprehensive documentation
- Video tutorials
- Email and chat support

### **Technical Support**

- API documentation
- Integration examples
- Developer resources

---

**Your EPG Manager Enterprise solution provides everything needed for professional EPG hosting and distribution!**
