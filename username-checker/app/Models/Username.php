<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Username extends Model
{
    protected $fillable = ['username', 'username_lower'];
}