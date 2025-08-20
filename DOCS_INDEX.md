# Documentation Index

## 📖 **Start Here**

### **For Project Overview**
- [`README.md`](README.md) - Main project description, features, how to use
- [`STATUS.md`](STATUS.md) - Current status, what's working, deployment info
- [`NEXT_STEPS.md`](NEXT_STEPS.md) - Immediate actions and clear priorities

## 🎯 **For Planning & Strategy**

### **Feature Development**
- [`FEATURE_ROADMAP.md`](FEATURE_ROADMAP.md) - Complete future development plan
- [`IMPROVEMENT_PLAN.md`](IMPROVEMENT_PLAN.md) - Technical architecture evolution
- [`PHASE_2_PLAN.md`](PHASE_2_PLAN.md) - How we built the modular system

## 🔧 **For Development Work**

### **AI Assistant Context**
- [`CLAUDE.md`](CLAUDE.md) - Guidelines for AI assistants working on the project
- Contains current architecture, known issues, safe modification guidelines

### **Testing & Quality**
- [`TESTING.md`](TESTING.md) - Manual testing checklist before deployment
- [`AUTOMATED_TESTING.md`](AUTOMATED_TESTING.md) - Test automation setup (optional)

### **Emergency Procedures**  
- [`ROLLBACK.md`](ROLLBACK.md) - Complete emergency rollback instructions
- How to revert changes if something breaks

## 📁 **File Organization**

### **Core Application**
```
├── index.html              # Main UI with 8 schema type buttons
├── app.js                  # Core application logic + new schema integration
├── validators.js           # Enhanced JSON-LD validation (Phase 1)
├── utils.js               # Shared utilities (Phase 2)
├── constants.js           # Configuration and dropdown options
├── schema-registry.js     # Plugin system for modular schemas
└── schemas/               # Individual schema implementations
    ├── localbusiness.js   # Local business schema
    ├── event.js          # Event schema  
    └── organization.js   # Organization schema
```

### **Server & Deployment**
```
├── server.js              # Local development server
├── api/analyze.js         # Vercel serverless function
├── vercel.json           # Deployment configuration
└── package.json          # Project metadata (no dependencies)
```

### **Documentation**
```
├── README.md              # Main project description
├── STATUS.md              # Current status & deployment info
├── NEXT_STEPS.md          # Immediate action plan
├── FEATURE_ROADMAP.md     # Future development plan
├── CLAUDE.md              # AI assistant guidelines
├── TESTING.md             # Manual testing procedures
├── AUTOMATED_TESTING.md   # Test automation setup
├── ROLLBACK.md            # Emergency procedures
├── IMPROVEMENT_PLAN.md    # Technical architecture details
├── PHASE_2_PLAN.md        # Modular system implementation
└── DOCS_INDEX.md          # This file
```

## 🎯 **Quick Reference by Task**

### **"I want to verify the deployment is working"**
→ [`STATUS.md`](STATUS.md) + [`NEXT_STEPS.md`](NEXT_STEPS.md)

### **"I want to plan the next features"**  
→ [`FEATURE_ROADMAP.md`](FEATURE_ROADMAP.md)

### **"I want to understand the technical architecture"**
→ [`CLAUDE.md`](CLAUDE.md) + [`IMPROVEMENT_PLAN.md`](IMPROVEMENT_PLAN.md)

### **"I want to test before deploying"**
→ [`TESTING.md`](TESTING.md)

### **"Something broke and I need to fix it"**
→ [`ROLLBACK.md`](ROLLBACK.md)

### **"I want an AI assistant to help with development"**
→ [`CLAUDE.md`](CLAUDE.md)

## 📋 **Documentation Maintenance**

### **Keep Updated**
- `STATUS.md` - After any deployment or major change
- `NEXT_STEPS.md` - As priorities shift
- `FEATURE_ROADMAP.md` - As features are completed or new requests come in

### **Reference Only** (Update Less Frequently)
- `CLAUDE.md` - When architecture changes significantly
- `TESTING.md` - When new features need testing procedures
- `ROLLBACK.md` - When rollback procedures change

### **Historical Record** (Rarely Update)
- `IMPROVEMENT_PLAN.md` - Documents how we got here
- `PHASE_2_PLAN.md` - Documents Phase 2 implementation

---

**Last Updated**: December 19, 2024  
**Maintained By**: Project owner + AI assistants  
**Purpose**: Ensure anyone can understand project status and next steps