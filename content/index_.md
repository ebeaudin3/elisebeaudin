---
title: "Welcome"
description: "This is your landing page."
---

## Welcome to My Website

<!-- Landing page with header image and text -->
    <div class="page-header" style="position: relative;">
      <img src="{{ .Site.Params.header_image | relURL }}" alt="Header" class="header-image" style="width: 100%; display: block;">
      
      <div class="header-text" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          text-shadow: 0 2px 5px rgba(0,0,0,0.7);
          text-align: center;
        ">
        <h1>{{ .Site.Params.header_text }}</h1>
      </div>
      
    </div>