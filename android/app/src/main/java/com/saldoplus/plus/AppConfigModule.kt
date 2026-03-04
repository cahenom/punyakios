package com.saldoplus.plus

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import java.util.HashMap

class AppConfigModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "AppConfig"
    }

    override fun getConstants(): MutableMap<String, Any> {
        val constants = HashMap<String, Any>()
        constants["APP_FLAVOR"] = BuildConfig.APP_FLAVOR
        return constants
    }
}
