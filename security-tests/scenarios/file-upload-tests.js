// File Upload Security Tests
// Tests: T9 from security protocol

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/test-config.js';
import { endpoints } from '../config/endpoints.js';

// Validate environment before running tests
config.validateEnvironment();

export const options = config.options.security;

export default function () {
  const baseUrl = config.baseUrl;
  
  // T9: File Upload Security Tests
  testFileUploadSecurity(baseUrl);
  
  sleep(1); // Rate limiting
}

/**
 * T9: File Upload Security
 * Target: File upload endpoints
 * Method: Test malicious file uploads, path traversal, executable prevention
 */
export function testFileUploadSecurity(baseUrl) {
  console.log('📁 T9: File Upload Security Tests');
  
  // Test 1: Malicious File Upload
  testMaliciousFileUpload(baseUrl);
  
  // Test 2: File Type Validation
  testFileTypeValidation(baseUrl);
  
  // Test 3: Path Traversal Prevention
  testPathTraversalPrevention(baseUrl);
  
  // Test 4: Executable File Prevention
  testExecutableFilePrevention(baseUrl);
}

function testMaliciousFileUpload(baseUrl) {
  console.log('Testing malicious file upload attempts...');
  
  // Test various malicious file contents
  const maliciousFiles = [
    {
      name: 'malware.txt',
      content: 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*',
      type: 'text/plain'
    },
    {
      name: 'script.js',
      content: 'alert("XSS"); document.location="http://evil.com";',
      type: 'application/javascript'
    },
    {
      name: 'payload.php',
      content: '<?php system($_GET["cmd"]); ?>',
      type: 'application/x-php'
    }
  ];
  
  maliciousFiles.forEach(file => {
    const formData = {
      file: http.file(file.content, file.name, file.type)
    };
    
    const response = http.post(`${baseUrl}/api/upload`, formData, {
      headers: {
        'X-Test-Type': 'malicious-file-upload',
        'X-File-Type': file.name.split('.').pop()
      },
      tags: { test: 'T9-malicious-upload' }
    });
    
    check(response, {
      'T9: Malicious file upload blocked': (r) => r.status === 400 || r.status === 403 || r.status === 422,
      'T9: Proper error message': (r) => {
        const body = r.body || '';
        return body.includes('file') && (body.includes('invalid') || body.includes('not allowed'));
      }
    });
  });
}

function testFileTypeValidation(baseUrl) {
  console.log('Testing file type validation...');
  
  // Test file extension spoofing
  const spoofedFiles = [
    {
      name: 'image.jpg.exe',
      content: 'MZ\x90\x00', // PE header
      type: 'image/jpeg'
    },
    {
      name: 'document.pdf.js',
      content: 'alert("malicious");',
      type: 'application/pdf'
    },
    {
      name: 'safe.txt',
      content: '#!/bin/bash\nrm -rf /',
      type: 'text/plain'
    }
  ];
  
  spoofedFiles.forEach(file => {
    const formData = {
      file: http.file(file.content, file.name, file.type)
    };
    
    const response = http.post(`${baseUrl}/api/upload/document`, formData, {
      headers: {
        'X-Test-Type': 'file-type-spoofing',
        'X-Spoofed-Extension': file.name
      },
      tags: { test: 'T9-file-type-validation' }
    });
    
    check(response, {
      'T9: File type spoofing detected': (r) => {
        // Should validate actual file content, not just extension/MIME type
        return r.status === 400 || r.status === 415 || r.status === 422;
      },
      'T9: Content-based validation': (r) => {
        const body = r.body || '';
        return body.includes('type') || body.includes('format') || body.includes('content');
      }
    });
  });
  
  // Test oversized files
  const oversizedContent = 'A'.repeat(10 * 1024 * 1024); // 10MB
  const oversizedFormData = {
    file: http.file(oversizedContent, 'large.txt', 'text/plain')
  };
  
  const oversizedResponse = http.post(`${baseUrl}/api/upload`, oversizedFormData, {
    headers: {
      'X-Test-Type': 'oversized-file'
    },
    tags: { test: 'T9-oversized-file' }
  });
  
  check(oversizedResponse, {
    'T9: Oversized file rejected': (r) => r.status === 413 || r.status === 400,
    'T9: Size limit enforced': (r) => {
      const body = r.body || '';
      return body.includes('size') || body.includes('large') || body.includes('limit');
    }
  });
}

function testPathTraversalPrevention(baseUrl) {
  console.log('Testing path traversal prevention...');
  
  // Test various path traversal payloads
  const traversalPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%252f..%252f..%252fetc%252fpasswd',
    '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd'
  ];
  
  traversalPayloads.forEach(payload => {
    const formData = {
      file: http.file('test content', payload, 'text/plain'),
      filename: payload
    };
    
    const response = http.post(`${baseUrl}/api/upload`, formData, {
      headers: {
        'X-Test-Type': 'path-traversal',
        'X-Traversal-Payload': payload
      },
      tags: { test: 'T9-path-traversal' }
    });
    
    check(response, {
      'T9: Path traversal blocked': (r) => r.status === 400 || r.status === 403,
      'T9: Filename sanitization': (r) => {
        const body = r.body || '';
        return body.includes('filename') || body.includes('path') || body.includes('invalid');
      }
    });
  });
  
  // Test upload with directory creation attempts
  const directoryPayloads = [
    'uploads/../admin/shell.php',
    'files/../../config/database.conf',
    'temp/../../../var/www/backdoor.php'
  ];
  
  directoryPayloads.forEach(payload => {
    const formData = {
      file: http.file('<?php echo "test"; ?>', payload, 'text/plain')
    };
    
    const response = http.post(`${baseUrl}/api/upload/save`, formData, {
      headers: {
        'X-Test-Type': 'directory-traversal',
        'X-Target-Path': payload
      },
      tags: { test: 'T9-directory-traversal' }
    });
    
    check(response, {
      'T9: Directory traversal prevented': (r) => r.status !== 200,
      'T9: Safe file storage': (r) => {
        if (r.status === 200) {
          const body = r.body || '';
          // Should not indicate file was saved in traversed location
          return !body.includes('admin') && !body.includes('config') && !body.includes('var/www');
        }
        return true;
      }
    });
  });
}

function testExecutableFilePrevention(baseUrl) {
  console.log('Testing executable file prevention...');
  
  // Test various executable file types
  const executableFiles = [
    { name: 'malware.exe', content: 'MZ\x90\x00\x03\x00\x00\x00', type: 'application/x-msdownload' },
    { name: 'script.bat', content: '@echo off\ndel /f /q C:\\*.*', type: 'application/x-bat' },
    { name: 'shell.sh', content: '#!/bin/bash\nrm -rf /', type: 'application/x-sh' },
    { name: 'macro.docm', content: 'PK\x03\x04', type: 'application/vnd.ms-word.document.macroEnabled.12' },
    { name: 'app.jar', content: 'PK\x03\x04', type: 'application/java-archive' }
  ];
  
  executableFiles.forEach(file => {
    const formData = {
      file: http.file(file.content, file.name, file.type)
    };
    
    const response = http.post(`${baseUrl}/api/upload`, formData, {
      headers: {
        'X-Test-Type': 'executable-file',
        'X-File-Extension': file.name.split('.').pop()
      },
      tags: { test: 'T9-executable-prevention' }
    });
    
    check(response, {
      'T9: Executable file blocked': (r) => r.status === 400 || r.status === 403 || r.status === 415,
      'T9: Security policy enforced': (r) => {
        const body = r.body || '';
        return body.includes('executable') || body.includes('not allowed') || body.includes('security');
      }
    });
  });
  
  // Test script injection in allowed file types
  const scriptInjectionFiles = [
    {
      name: 'image.svg',
      content: '<svg onload="alert(\'XSS\')" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>',
      type: 'image/svg+xml'
    },
    {
      name: 'data.xml',
      content: '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>',
      type: 'application/xml'
    }
  ];
  
  scriptInjectionFiles.forEach(file => {
    const formData = {
      file: http.file(file.content, file.name, file.type)
    };
    
    const response = http.post(`${baseUrl}/api/upload`, formData, {
      headers: {
        'X-Test-Type': 'script-injection',
        'X-Injection-Type': file.name.split('.').pop()
      },
      tags: { test: 'T9-script-injection' }
    });
    
    check(response, {
      'T9: Script injection prevented': (r) => {
        // Should either block the file or sanitize the content
        return r.status === 400 || r.status === 403 || r.status === 422;
      },
      'T9: Content sanitization': (r) => {
        const body = r.body || '';
        return body.includes('content') || body.includes('sanitize') || body.includes('script');
      }
    });
  });
}

export { testFileUploadSecurity };
