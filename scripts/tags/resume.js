'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const RESUME_DATA_PATH = path.join(hexo.source_dir, 'resume', '_resume.yml');

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(value) {
  return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, '<span class="resume-highlight">$1</span>');
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function errorBlock(message) {
  return [
    '<link rel="stylesheet" href="/resume/resume.css">',
    '<div class="resume-error">',
    '<strong>简历数据错误：</strong>',
    escapeHtml(message),
    '</div>'
  ].join('');
}

function validateResumeData(data) {
  if (!data || typeof data !== 'object') {
    return '缺少 source/resume/_resume.yml，或文件内容不是对象。';
  }

  if (!data.profile || typeof data.profile !== 'object') {
    return '缺少 profile 配置。';
  }

  if (!hasText(data.profile.name)) {
    return '缺少 profile.name。';
  }

  if (!hasText(data.profile.intent) && !hasText(data.profile.title)) {
    return '缺少 profile.intent。';
  }

  if (!Array.isArray(data.skills)) {
    return 'skills 必须是列表。';
  }

  if (!Array.isArray(data.sections)) {
    return 'sections 必须是列表。';
  }

  return '';
}

function loadResumeData() {
  try {
    return yaml.load(fs.readFileSync(RESUME_DATA_PATH, 'utf8'));
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }

    return {
      __resumeError: '读取 source/resume/_resume.yml 失败：' + error.message
    };
  }
}

function renderInfoRow(label, value, className) {
  if (!hasText(value)) {
    return '';
  }

  return [
    '<div class="resume-info-row' + (hasText(className) ? ' ' + escapeHtml(className) : '') + '">',
    '<span class="resume-info-label">' + renderInline(label) + '：</span>',
    '<span class="resume-info-value">' + renderInline(value) + '</span>',
    '</div>'
  ].join('');
}

function renderEducationText(educationSections) {
  var firstSection = asArray(educationSections)[0];
  var firstItem = asArray(firstSection && firstSection.items)[0];

  if (!firstItem) {
    return '';
  }

  return [
    firstItem.title,
    firstItem.subtitle,
    hasText(firstItem.time) ? '(' + firstItem.time + ')' : ''
  ].filter(hasText).join('/');
}

function renderHeader(profile, educationSections) {
  var education = hasText(profile.education)
    ? profile.education
    : renderEducationText(educationSections);

  return [
    '<header class="resume-header">',
    '<div class="resume-header-left">',
    '<div class="resume-name" role="heading" aria-level="1">' + renderInline(profile.name) + '</div>',
    renderInfoRow('求职意向', profile.intent || profile.title),
    renderInfoRow('工作经验', profile.experience),
    '</div>',
    '<div class="resume-header-right">',
    renderInfoRow('联系方式', profile.phone),
    renderInfoRow('电子邮箱', profile.email),
    renderInfoRow('出生年月', profile.birth),
    '</div>',
    renderInfoRow('教育经历', education, 'resume-education-row'),
    '</header>'
  ].join('');
}

function renderSkills(skills) {
  var skillItems = asArray(skills)
    .map(function (skill) {
      return [
        '<div class="resume-skill-name">' + renderInline(skill && skill.name) + '</div>',
        '<div class="resume-skill-detail">' + renderInline(skill && skill.detail) + '</div>'
      ].join('');
    })
    .join('');

  return [
    '<section class="resume-section">',
    '<div class="resume-section-title" role="heading" aria-level="2">专业技能</div>',
    '<div class="resume-skill-grid">',
    skillItems,
    '</div>',
    '</section>'
  ].join('');
}

function renderBullets(bullets) {
  if (!Array.isArray(bullets) || bullets.length === 0) {
    return '';
  }

  return [
    '<ul class="resume-list">',
    bullets.map(function (bullet) {
      return '<li>' + renderInline(bullet) + '</li>';
    }).join(''),
    '</ul>'
  ].join('');
}

function renderItem(item) {
  var subtitle = hasText(item && item.subtitle)
    ? '<div class="resume-item-subtitle">' + renderInline(item.subtitle) + '</div>'
    : '';
  var time = hasText(item && item.time)
    ? '<div class="resume-time">' + renderInline(item.time) + '</div>'
    : '';

  return [
    '<article class="resume-item">',
    '<div class="resume-item-head">',
    '<div>',
    '<div class="resume-item-title">' + renderInline(item && item.title) + '</div>',
    subtitle,
    '</div>',
    time,
    '</div>',
    renderBullets(item && item.bullets),
    '</article>'
  ].join('');
}

function renderSections(sections) {
  return asArray(sections)
    .map(function (section) {
      return [
        '<section class="resume-section">',
        '<div class="resume-section-title" role="heading" aria-level="2">' + renderInline(section && section.title) + '</div>',
        asArray(section && section.items).map(renderItem).join(''),
        '</section>'
      ].join('');
    })
    .join('');
}

function splitEducationSection(sections) {
  var result = {
    education: [],
    others: []
  };

  asArray(sections).forEach(function (section) {
    var title = section && section.title;
    if (title === '教育背景' || title === '教育经历') {
      result.education.push(section);
    } else {
      result.others.push(section);
    }
  });

  return result;
}

hexo.extend.tag.register('resume', function () {
  var resumeData = loadResumeData();
  var validationError = resumeData && resumeData.__resumeError
    ? resumeData.__resumeError
    : validateResumeData(resumeData);

  if (validationError) {
    return errorBlock(validationError);
  }

  var groupedSections = splitEducationSection(resumeData.sections);

  return [
    '<link rel="stylesheet" href="/resume/resume.css">',
    '<div class="resume-document" data-resume-document>',
    '<div class="resume-toolbar">',
    '<p class="resume-toolbar-title">博客主题预览，导出时自动切换为 A4 PDF</p>',
    '<button class="resume-print-button" type="button" data-resume-print>导出 PDF</button>',
    '</div>',
    '<div class="resume-pages" data-resume-pages></div>',
    '<main class="resume-source" data-resume-source>',
    renderHeader(resumeData.profile, groupedSections.education),
    renderSections(groupedSections.others),
    renderSkills(resumeData.skills),
    '</main>',
    '</div>',
    '<script src="/resume/resume.js"></script>'
  ].join('');
}, { ends: false });
